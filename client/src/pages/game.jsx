import { useEffect, useState, useContext } from "react";
import Map from "../components/map.jsx";
import RouteList from "../components/routeList.jsx";
import { useGame } from "../context/gameContext.jsx";
import { getNetwork, getMyGames, getRanking } from "../utils/api.js";
import { AuthContext } from "../context/authContext.jsx";

function parseUTC(dateStr) {
  if (!dateStr) return null;
  const s = dateStr.replace(" ", "T");
  return new Date(s.endsWith("Z") ? s : `${s}Z`);
}

function Game() {
  const { game, startGame, submitGame, time, finishedRef, resetGame, phase } = useGame();

  const [mapOpen, setMapOpen] = useState(false);
  const [route, setRoute] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [loadingPastGames, setLoadingPastGames] = useState(true);
  const [finishedGame, setFinishedGame] = useState(false);
  const [replayEvents, setReplayEvents] = useState([]);
  const [replayStep, setReplayStep] = useState(-1);
  const [submittedRoute, setSubmittedRoute] = useState([]);
  const [replayActive, setReplayActive] = useState(false);
  const [globalRanking, setGlobalRanking] = useState([]);
  const [warning, setWarning] = useState("");
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [incompleteRoute, setIncompleteRoute] = useState(false);

  const [network, setNetwork] = useState({
    stations: [],
    segments: [],
    lines: [],
  });
  const { user } = useContext(AuthContext);

  const gameActive = phase === "playing" && !!game;
  const gameStarted = (!!game && phase !== "idle") || replayActive || finishedGame || timeoutOccurred;

  // Resolve station ID from various property names
  const resolveStationId = (value) => {
    if (value == null) return null;
    if (typeof value === "object") return value.id ?? null;
    return value;
  };

  const getGameStartId = () =>
    resolveStationId(
      game?.startStation?.id ??
      game?.start_station ??
      game?.startStation ??
      game?.from
    );

  const getGameEndId = () =>
    resolveStationId(
      game?.endStation?.id ??
      game?.end_station ??
      game?.endStation ??
      game?.to
    );

  const getStationName = (id) => {
    const stationId = resolveStationId(id);
    const station = network.stations.find(
      (s) => s.id === stationId || s.id?.toString() === stationId?.toString()
    );
    return station?.name || `Stazione ${stationId}`;
  };

  // Load network and past games on mount
  useEffect(() => {
    (async () => {
      try {
        const networkData = await getNetwork();
        setNetwork(networkData || { stations: [], segments: [], lines: [] });
      } catch (error) {
        console.error("Failed to load network:", error);
        setNetwork({ stations: [], segments: [], lines: [] });
      }

      try {
        const games = await getMyGames();
        setPastGames(games || []);
      } catch (error) {
        console.error("Failed to load past games:", error);
        setPastGames([]);
      } finally {
        setLoadingPastGames(false);
      }
    })();
  }, []);

  const cleanRoute = (r) =>
    r.filter((x) => x !== null && x !== undefined);

  // Initialize route when game starts
  useEffect(() => {
    if (game) {
      const startId = getGameStartId();
      if (startId != null) {
        setRoute(cleanRoute([startId]));
        setReplayActive(false);
        setReplayEvents([]);
        setReplayStep(-1);
        setSubmittedRoute([]);
        setFinishedGame(false);
        setTimeoutOccurred(false);
        setIncompleteRoute(false);
        setWarning("");
      }
    }
  }, [game]);

  // Handle replay auto-advance
  useEffect(() => {
    if (!replayActive || replayEvents.length === 0) return;

    const maxStep = replayEvents.length - 1;
    if (replayStep > maxStep) {
      setReplayActive(false);
      setFinishedGame(true);
      return;
    }

    const timer = setTimeout(() => {
      if (replayStep >= maxStep) {
        setReplayActive(false);
        setFinishedGame(true);
      } else {
        setReplayStep((step) => step + 1);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [replayActive, replayStep, replayEvents.length]);

  // Check for timeout
  useEffect(() => {
    if (gameActive && time === 0) {
      setTimeoutOccurred(true);
      setFinishedGame(true);
      setRoute([]);
    }
  }, [time, gameActive]);

  // Calculate next valid stations in real-time
  const getValidNextStations = () => {
    if (!gameActive || !game || network.stations.length === 0) return [];
    if (route.length === 0) {
      const startId = getGameStartId();
      return startId != null ? [Number(startId)] : [];
    }

    const last = Number(route[route.length - 1]);

    // Find all segments connected to the last station in our route
    const adjacentSegments = network.segments.filter(
      (seg) => Number(seg.station1) === last || Number(seg.station2) === last
    );

    const validNexts = [];

    for (const seg of adjacentSegments) {
      const nextStationId = Number(seg.station1) === last ? Number(seg.station2) : Number(seg.station1);

      // Rule 1: Segment must not be used already in the route in either direction
      let segmentUsed = false;
      for (let i = 0; i < route.length - 1; i++) {
        const r1 = Number(route[i]);
        const r2 = Number(route[i + 1]);
        if ((r1 === last && r2 === nextStationId) || (r1 === nextStationId && r2 === last)) {
          segmentUsed = true;
          break;
        }
      }
      if (segmentUsed) continue;

      // Rule 2: Line change check
      if (route.length >= 2) {
        const secondLast = Number(route[route.length - 2]);

        // Find previous segment to see its line
        const prevSeg = network.segments.find(
          (s) =>
            (Number(s.station1) === secondLast && Number(s.station2) === last) ||
            (Number(s.station2) === secondLast && Number(s.station1) === last)
        );

        const prevLine = prevSeg ? prevSeg.line : null;
        const nextLine = seg.line;

        if (prevLine !== null && prevLine !== nextLine) {
          // Line change detected! 'last' station must be an interchange station
          const lastStation = network.stations.find((s) => Number(s.id) === last);
          const isInterchange =
            lastStation &&
            (Number(lastStation.interchange) === 1 || lastStation.interchange === true);

          if (!isInterchange) {
            continue; // Line changes only at interchange stations
          }
        }
      }

      validNexts.push(nextStationId);
    }

    return validNexts;
  };

  // Handle clicking a station on the map or connection buttons
  const handleStationClick = (stationId) => {
    if (!gameActive) return;
    const startId = Number(getGameStartId());
    const targetId = Number(stationId);

    const lastSelected = route.length > 0 ? Number(route[route.length - 1]) : null;

    if (targetId === lastSelected) {
      // Clicked current position: remove last step if route has more than just the start station
      if (route.length > 1) {
        setRoute(route.slice(0, -1));
        setWarning("");
      }
      return;
    }

    const validNexts = getValidNextStations();
    if (validNexts.includes(targetId)) {
      setRoute([...route, targetId]);
      setWarning("");
      return;
    }

    // Check for backtracking (clicking on a station already in the path)
    const indexInRoute = route.lastIndexOf(targetId);
    if (indexInRoute >= 0 && indexInRoute < route.length - 1) {
      setRoute(route.slice(0, indexInRoute + 1));
      setWarning("");
      return;
    }

    // Invalid click: explain why to the user
    // Is it adjacent but line change not allowed?
    const isAdjacent = network.segments.some(
      (seg) =>
        (Number(seg.station1) === lastSelected && Number(seg.station2) === targetId) ||
        (Number(seg.station2) === lastSelected && Number(seg.station1) === targetId)
    );

    if (isAdjacent) {
      setWarning("Cambio linea non consentito: questa non è una stazione di interscambio!");
    } else {
      setWarning("Seleziona solo stazioni adiacenti collegate da una linea!");
    }

    setTimeout(() => setWarning(""), 4000);
  };

  const handleStartGame = async () => {
    try {
      setMapOpen(false);
      setRoute([]);
      setFinishedGame(false);
      setReplayActive(false);
      setReplayEvents([]);
      setReplayStep(-1);
      setSubmittedRoute([]);
      setTimeoutOccurred(false);
      setIncompleteRoute(false);
      setWarning("");
      await startGame();
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Impossibile avviare il gioco");
    }
  };

  const refreshRankings = async () => {
    try {
      const [personal, global] = await Promise.all([getMyGames(), getRanking()]);
      setPastGames(personal || []);
      setGlobalRanking(global || []);
    } catch (error) {
      console.error("Failed to refresh rankings:", error);
    }
  };

  const finishGame = async () => {
    try {
      const endId = Number(getGameEndId());

      // Allow submit even with incomplete route
      const isComplete =
        route && route.length >= 2 && Number(route[route.length - 1]) === endId;

      if (!isComplete) {
        // Incomplete route: submit to server anyway (server will record score 0)
        if (!game) return;
        setMapOpen(false);
        setIncompleteRoute(true);
        setFinishedGame(true);
        // Still call the API so the game is recorded with 0 points
        try {
          await submitGame(route && route.length >= 2 ? route : [getGameStartId()]);
        } catch (_) {
          // ignore submit error for incomplete routes
        }
        await refreshRankings();
        return;
      }

      setMapOpen(false);

      if (!game) {
        console.error("No active game");
        return;
      }

      const data = await submitGame(route);

      if (!data) {
        alert("Errore durante il submit");
        finishedRef.current = false;
        return;
      }

      if (!data.valid) {
        setIncompleteRoute(false);
        setFinishedGame(true);
        setRoute([]);
        await refreshRankings();
        return;
      }

      // Valid route: prepare replay
      setIncompleteRoute(false);
      setSubmittedRoute(route);
      setReplayEvents(data.events || []);
      setReplayStep(0);
      setReplayActive(true);

      await refreshRankings();
    } catch (error) {
      console.error("Failed to finish game:", error);
      alert("Errore durante il submit");
      finishedRef.current = false;
    }
  };

  const handlePlayAgain = async () => {
    resetGame();
    setRoute([]);
    setFinishedGame(false);
    setReplayActive(false);
    setReplayEvents([]);
    setReplayStep(-1);
    setSubmittedRoute([]);
    setMapOpen(false);
    setTimeoutOccurred(false);
    setIncompleteRoute(false);
    setWarning("");
  };

  const highlightedRoute = replayActive ? submittedRoute.slice(0, replayStep + 2) : route;
  const currentEvent = replayActive && replayStep >= 0 ? replayEvents[replayStep] : null;
  const startId = getGameStartId();
  const endId = getGameEndId();

  return (
    <div className="game-page">
      {!gameStarted && (
        <div className="dashboard-grid">
          {/* Personal Scores Card */}
          <div className="card dashboard-card">
            <h2 className="card-title">Classifica Personale</h2>
            {loadingPastGames ? (
              <div className="spinner-center"><div className="spinner"></div></div>
            ) : pastGames.length > 0 ? (
              <div className="list-scores">
                {pastGames.slice(0, 10).map((gameItem, idx) => {
                  const date = parseUTC(gameItem.created_at);
                  return (
                    <div key={gameItem.id} className="score-item">
                      <div className="score-rank">#{idx + 1}</div>
                      <div className="score-details">
                        <div className="score-date">
                          {date ? date.toLocaleString("it-IT") : "Data sconosciuta"}
                        </div>
                      </div>
                      <div className="score-value">{gameItem.score} pt</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-data">Nessuna partita giocata. Inizia una nuova partita ora!</p>
            )}
          </div>

          {/* Quick Play Card */}
          <div className="card dashboard-card play-card">
            <h2 className="card-title">Sei pronto per la corsa?</h2>
            <p className="card-desc">
              Pianifica il tragitto metropolitano più efficiente dalla partenza all'arrivo.
              Ogni fermata riserva eventi imprevisti! Hai 90 secondi.
            </p>
            <div className="dashboard-buttons">
              <button className="btn btn-secondary" onClick={() => setMapOpen((open) => !open)}>
                {mapOpen ? "Nascondi Mappa" : "Visualizza Rete"}
              </button>
              <button className="btn btn-primary" onClick={handleStartGame}>Nuova Partita 🚀</button>
            </div>

            {mapOpen && (
              <div className="map-modal-container">
                <div style={{ width: "100%", height: "420px", marginTop: "15px" }}>
                  <Map
                    stations={network.stations}
                    segments={network.segments}
                    lines={network.lines}
                    showLines={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {gameStarted && (
        <div className="game-workspace">
          {/* Main Map Panel */}
          <div className="map-panel">
            <div className="hud-header">
              <div className="hud-info">
                <strong>Partenza:</strong> <span className="hud-station start">{startId ? getStationName(startId) : "?"}</span>
                <span className="hud-arrow">→</span>
                <strong>Arrivo:</strong> <span className="hud-station end">{endId ? getStationName(endId) : "?"}</span>
              </div>
              <div className={`hud-timer ${time <= 15 ? "timer-low" : ""}`}>
                ⏱ {time}s
              </div>
            </div>

            {/* Warning Toast message if any */}
            {warning && <div className="warning-toast">{warning}</div>}

            <div className="map-canvas-container">
              <Map
                stations={network.stations}
                segments={network.segments}
                lines={network.lines}
                showLines={false}
                highlightedRoute={highlightedRoute}
                validNextStations={gameActive ? getValidNextStations() : []}
                onStationClick={gameActive ? handleStationClick : null}
                startStationId={startId}
                endStationId={endId}
              />

              {/* Step replay overlay */}
              {currentEvent && (
                <div className="event-toast">
                  <div className="event-badge">Evento {replayStep + 1} / {replayEvents.length}</div>
                  <div className="event-description">{currentEvent.description || "Segmento completato"}</div>
                  <div className={`event-points ${currentEvent.points >= 0 ? "positive" : "negative"}`}>
                    {currentEvent.points >= 0 ? `+${currentEvent.points}` : currentEvent.points} pt
                  </div>
                </div>
              )}

              {/* ⏰ Timeout popup */}
              {timeoutOccurred && (
                <div className="result-overlay">
                  <div className="result-card">
                    <div className="result-icon">⏰</div>
                    <h2>Tempo Scaduto!</h2>
                    <p className="result-desc error-desc">
                      Non hai completato la rotta entro 90 secondi.<br />
                      <strong>Hai perso tutti i punti.</strong>
                    </p>
                    <div className="result-score-box error-box">
                      <span className="score-label">Punteggio Finale</span>
                      <span className="score-val">0</span>
                    </div>
                    <button className="btn btn-primary" onClick={handlePlayAgain}>Gioca Ancora</button>
                  </div>
                </div>
              )}

              {/* 🏁 Game Result popup (incomplete / invalid / success) */}
              {finishedGame && !replayActive && !timeoutOccurred && (
                <div className="result-overlay">
                  <div className="result-card">
                    {incompleteRoute ? (
                      <>
                        <div className="result-icon">⚠️</div>
                        <h2>Rotta Incompleta!</h2>
                        <p className="result-desc error-desc">
                          Non hai raggiunto la stazione di arrivo.<br />
                          <strong>Hai perso tutti i punti.</strong>
                        </p>
                        <div className="result-score-box error-box">
                          <span className="score-label">Punteggio Finale</span>
                          <span className="score-val">0</span>
                        </div>
                      </>
                    ) : replayEvents.length > 0 ? (
                      <>
                        <div className="result-icon">🏁</div>
                        <h2>Fine Corsa!</h2>
                        <p className="result-desc">Tragitto completato con successo.</p>
                        <div className="result-score-box">
                          <span className="score-label">Punteggio Finale</span>
                          <span className="score-val">
                            {replayEvents.reduce((acc, curr) => acc + (curr.points ?? 0), 20)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="result-icon">❌</div>
                        <h2>Percorso Non Valido</h2>
                        <p className="result-desc error-desc">Il percorso pianificato non era valido.</p>
                        <div className="result-score-box error-box">
                          <span className="score-label">Punteggio Finale</span>
                          <span className="score-val">0</span>
                        </div>
                      </>
                    )}
                    <button className="btn btn-primary" onClick={handlePlayAgain}>Gioca Ancora</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Route Planning Panel */}
          <div className="planner-sidebar">
            {gameActive && (
              <div className="sidebar-hud">
                <button
                  onClick={finishGame}
                  className="btn btn-success btn-block"
                  style={{ fontSize: "16px", fontWeight: "bold" }}
                >
                  🚀 Invia Percorso
                </button>
              </div>
            )}

            <div className="sidebar-content">
              {gameActive && (
                <RouteList
                  segments={network.segments}
                  stations={network.stations}
                  lines={network.lines}
                  route={route}
                  setRoute={setRoute}
                  validNextStations={getValidNextStations()}
                  onStationClick={handleStationClick}
                  startStationId={startId}
                  endStationId={endId}
                  onSegmentWarning={setWarning}
                />
              )}

              {replayActive && (
                <div className="replay-hud">
                  <h3>Simulazione Corsa</h3>
                  <p>Stiamo guidando il treno lungo il percorso pianificato. Osserva gli eventi sulla sinistra...</p>
                  <div className="replay-progress">
                    <div className="progress-bar-fill" style={{ width: `${((replayStep + 1) / replayEvents.length) * 100}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;