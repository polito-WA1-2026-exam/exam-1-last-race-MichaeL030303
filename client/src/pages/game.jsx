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
  const [network, setNetwork] = useState({
    stations: [],
    segments: [],
    lines: [],
  });
  const { user, loading } = useContext(AuthContext);

  const gameActive = phase === "playing" && !!game;
  const gameStarted = (!!game && phase !== "idle") || replayActive;

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
    return station?.name || `Station ${stationId}`;
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
      }
    }
  }, [game]);

  useEffect(() => {
  console.log("ROUTE:", route);
}, [route]);

useEffect(() => {
  console.log("NETWORK:", network);
}, [network]);
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

  const handleStartGame = async () => {
    try {
      setMapOpen(false);
      setRoute([]);
      setFinishedGame(false);
      setReplayActive(false);
      setReplayEvents([]);
      setReplayStep(-1);
      setSubmittedRoute([]);
      await startGame();
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game");
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
      if (!route || route.length < 2) {
        alert("Seleziona un percorso valido prima del submit");
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
        alert(`Invalid route: ${data.reason}`);
        setFinishedGame(true);
        setRoute([]);
        await refreshRankings();
        return;
      }

      // Valid route: prepare replay
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
  };

  const highlightedRoute = replayActive ? submittedRoute.slice(0, replayStep + 2) : [];
  const currentEvent = replayActive && replayStep >= 0 ? replayEvents[replayStep] : null;
  const startId = getGameStartId();
  const endId = getGameEndId();

  return (
    <div className="game-page">
      {!gameStarted && (
        <>
          <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff" }}>
            <h2 style={{ margin: "0 0 10px" }}>Classifica personale</h2>

            {loadingPastGames ? (
              <p>Caricamento...</p>
            ) : pastGames.length > 0 ? (
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {pastGames.slice(0, 10).map((gameItem) => {
                  const date = parseUTC(gameItem.created_at);
                  return (
                    <li key={gameItem.id}>
                      {date ? date.toLocaleString() : "Data sconosciuta"}: {gameItem.score} punti
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p>Nessun gioco passato</p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button onClick={() => setMapOpen((open) => !open)}>
              {mapOpen ? "Chiudi Map" : "Apri Map"}
            </button>
            <button onClick={handleStartGame}>Inizia Gioco</button>
          </div>

          {mapOpen && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 style={{ margin: 0 }}>Mappa</h3>
                <button onClick={() => setMapOpen(false)}>Chiudi</button>
              </div>
              <div style={{ width: "100%", height: "500px" }}>
                <Map stations={network.stations} segments={network.segments} lines={network.lines} showLines={true} />
              </div>
            </div>
          )}
        </>
      )}

      {gameStarted && (
        <div style={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>
          <div style={{ flex: 3, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch", overflow: "hidden", position: "relative" }}>
            <div style={{ width: "100%", padding: "10px", background: "#fff", borderBottom: "1px solid #ddd" }}>
              <strong>Partenza:</strong> {startId ? getStationName(startId) : "?"} • <strong>Arrivo:</strong> {endId ? getStationName(endId) : "?"}
            </div>

            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
              <Map
                stations={network.stations}
                segments={network.segments}
                lines={network.lines}
                showLines={false}
                highlightedRoute={highlightedRoute}
              />

              {currentEvent && (
                <div style={{ position: "absolute", top: 12, left: 12, padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.8)", color: "#fff", maxWidth: "320px", zIndex: 5 }}>
                  <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                    Evento {replayStep + 1} / {replayEvents.length}
                  </div>
                  <div>{currentEvent.description || "Azione completata"}</div>
                  <div style={{ marginTop: "8px", fontWeight: "bold" }}>{currentEvent.points ?? 0} punti</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, borderLeft: "1px solid #ddd", display: "flex", flexDirection: "column", background: "#fafafa" }}>
            <div style={{ padding: "10px", borderBottom: "1px solid #ddd", fontWeight: "bold", background: "#fff" }}>
              ⏱ Tempo: {time}s
            </div>

            {gameActive && (
              <div style={{ padding: "10px", display: "flex", gap: "10px" }}>
                <button onClick={finishGame} style={{ flex: 1 }}>
                  Invia
                </button>
              </div>
            )}

            {finishedGame && (
              <div style={{ padding: "10px" }}>
                <button onClick={handlePlayAgain} style={{ width: "100%" }}>
                  Gioca di nuovo
                </button>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
              {gameActive && (
                <RouteList
                  segments={network.segments}
                  stations={network.stations}
                  route={route}
                  setRoute={setRoute}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;