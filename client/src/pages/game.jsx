import { useEffect, useRef, useState } from "react";

import Map from "../components/Map.jsx";
import RouteList from "../components/RouteList.jsx";

import { useGame } from "../context/GameContext";

function Game() {
  const [mapOpen, setMapOpen] = useState(false);
  const [route, setRoute] = useState([]);
  const [pastGames, setPastGames] = useState([]);
  const [loadingPastGames, setLoadingPastGames] = useState(true);
  const [finishedGame, setFinishedGame] = useState(false);
  const [replayEvents, setReplayEvents] = useState([]);
  const [replayStep, setReplayStep] = useState(-1);
  const [submittedRoute, setSubmittedRoute] = useState([]);
  const [replayActive, setReplayActive] = useState(false);

  const { game, startGame, setGame, time, submitGame } = useGame();
  const gameActive = !!game && !finishedGame;
  const gameStarted = gameActive || replayActive;

  const [network, setNetwork] = useState({
    stations: [],
    segments: [],
    lines: [],
  });

  const finishedRef = useRef(false);

  const resolveStationId = (value) => {
    if (value == null) return null;
    if (typeof value === "object") return value.id ?? null;
    return value;
  };

  const getGameStartId = () =>
    resolveStationId(
      game?.start ??
      game?.startStation ??
      game?.start_station ??
      game?.from ??
      game?.fromStation ??
      game?.from_station
    );

  const getGameEndId = () =>
    resolveStationId(
      game?.end ??
      game?.endStation ??
      game?.end_station ??
      game?.to ??
      game?.toStation ??
      game?.to_station
    );

  const getStationName = (id) => {
    const stationId = resolveStationId(id);
    const station = network.stations.find((s) =>
      s.id === stationId || s.id?.toString() === stationId?.toString()
    );
    return station?.name || stationId || "Sconosciuto";
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/network", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setNetwork(data))
      .catch(() => setNetwork({ stations: [], segments: [], lines: [] }));

    fetch("http://localhost:3001/api/game/my-games", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPastGames(data || []))
      .catch(() => setPastGames([]))
      .finally(() => setLoadingPastGames(false));
  }, []);

  useEffect(() => {
    const startId = getGameStartId();

    if (game && startId != null) {
      setRoute([startId]);
      setReplayActive(false);
      setReplayEvents([]);
      setReplayStep(-1);
      setSubmittedRoute([]);
    }
  }, [game]);

  useEffect(() => {
    if (!replayActive || replayStep < 0 || replayEvents.length === 0) return;
    if (replayStep >= replayEvents.length - 1) return;

    const timer = setTimeout(() => {
      setReplayStep((step) => step + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [replayActive, replayStep, replayEvents.length]);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = () => {
    setTime(90);
    finishedRef.current = false;

    stopTimer();

    intervalRef.current = setInterval(() => {
      if (finishedRef.current) return;

      setTime((prev) => {
        if (prev <= 1) {
          finishGame(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartGame = async () => {
    setMapOpen(false);
    setRoute([]);
    setFinishedGame(false);
    setReplayActive(false);
    setReplayEvents([]);
    setReplayStep(-1);
    setSubmittedRoute([]);

    await startGame();
  };

  const finishGame = async (isAuto = false) => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    setMapOpen(false);

    if (!game) return;

    const data = await submitGame(route);
    if (!data) {
      finishedRef.current = false;
      return;
    }

    if (!data.valid) {
      finishedRef.current = false;
      console.error("Route invalid:", data.reason);
      alert(`Invalid route: ${data.reason}`);
      setFinishedGame(true);
      setRoute([]);
      setGame(null);
      return;
    }

    setSubmittedRoute(route);
    setReplayEvents(data.events || []);
    setReplayStep(0);
    setReplayActive(true);
    setGame(null);
  };

  const highlightedRoute = replayActive
    ? submittedRoute.slice(0, replayStep + 2)
    : [];

  const currentEvent = replayActive && replayStep >= 0
    ? replayEvents[replayStep]
    : null;
  
  const startId = getGameStartId();
  const endId = getGameEndId();
  
  useEffect(() => {
    if (!replayActive || replayEvents.length === 0) return;

    const maxStep = replayEvents.length - 1;
    const timer = setTimeout(() => {
      if (replayStep >= maxStep) {
        setReplayActive(false);
        setFinishedGame(true);
        setRoute([]);
        setSubmittedRoute([]);
        setReplayEvents([]);
        setReplayStep(-1);
        setGame(null);
        return;
      }
      setReplayStep((step) => step + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [replayActive, replayStep, replayEvents.length]);

  return (
    <div className="game-page">
      {!gameStarted && (
        <>
          <div
            className="personal-leaderboard"
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "#fff",
            }}
          >
            <h2 style={{ margin: "0 0 10px" }}>Classifica personale</h2>

            {loadingPastGames ? (
              <div>Caricamento...</div>
            ) : pastGames.length > 0 ? (
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {pastGames.slice(0, 10).map((gameItem) => {
                  const date = new Date(
                    gameItem.created_at || gameItem.createdAt || gameItem.date
                  );

                  return (
                    <li
                      key={
                        gameItem.id ??
                        `${gameItem.score}-${gameItem.created_at || gameItem.createdAt || gameItem.date}`
                      }
                    >
                      {isNaN(date.getTime())
                        ? "Data sconosciuta"
                        : date.toLocaleString()}
                      : {gameItem.score} punti
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div>Nessun gioco passato</div>
            )}
          </div>

          <div className="setup-buttons" style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setMapOpen((open) => !open)}>
              {mapOpen ? "Chiudi Map" : "Open Map"}
            </button>
            <button onClick={handleStartGame}>Start Game</button>
          </div>

          {mapOpen && (
            <div
              className="map-preview"
              style={{
                marginTop: "20px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0 }}>Anteprima mappa</h3>
                <button onClick={() => setMapOpen(false)}>Chiudi</button>
              </div>
              <div style={{ width: "100%", height: "500px" }}>
                <Map
                  stations={network.stations}
                  segments={network.segments}
                  lines={network.lines}
                  showLines={true}
                />
              </div>
            </div>
          )}
        </>
      )}

      {gameStarted && (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "calc(100vh - 80px)",
          }}
        >
          <div
            style={{
              flex: 3,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "stretch",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "100%",
                padding: "10px",
                background: "#fff",
                borderBottom: "1px solid #ddd",
              }}
            >
              <strong>Partenza:</strong> {startId ? getStationName(startId) : "?"}{" "}
              • <strong>Arrivo:</strong> {endId ? getStationName(endId) : "?"}
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
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "rgba(0,0,0,0.8)",
                  color: "#fff",
                  maxWidth: "320px",
                  zIndex: 5,
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                  {`Evento ${replayStep + 1} / ${replayEvents.length}`}
                </div>
                <div>{currentEvent.description || currentEvent.text || "Azione completata"}</div>
                <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                  +{currentEvent.points ?? currentEvent.score ?? 0} punti
                </div>
              </div>
            )}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              borderLeft: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              background: "#fafafa",
            }}
          >
            <div
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                fontWeight: "bold",
                background: "#fff",
              }}
            >
              ⏱ Time: {time}s
            </div>

            <div style={{ padding: "10px" }}>
              <button onClick={() => finishGame(false)}>Submit</button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
              }}
            >
              <RouteList
                segments={network.segments}
                stations={network.stations}
                route={route}
                setRoute={setRoute}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;