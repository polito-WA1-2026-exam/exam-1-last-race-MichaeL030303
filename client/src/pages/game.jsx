import { useEffect, useRef, useState } from "react";

import Map from "../components/Map.jsx";
import RouteList from "../components/RouteList.jsx";

import { useGame } from "../context/GameContext";

function Game() {
  const [mapOpen, setMapOpen] = useState(false);
  const [route, setRoute] = useState([]);

  const { game, startGame } = useGame();

  const [network, setNetwork] = useState({
    stations: [],
    segments: [],
    lines: [],
  });

  const [time, setTime] = useState(90);

  const intervalRef = useRef(null);
  const finishedRef = useRef(false); // 🔥 BLOCCO TOTALE

  useEffect(() => {
    fetch("http://localhost:3001/api/network", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setNetwork(data));
  }, []);

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

      setTime(prev => {
        if (prev <= 1) {
          finishGame(true); // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartGame = async () => {
    setMapOpen(false);
    setRoute([]);

    await startGame();
    startTimer();
  };

  // 💥 FUNZIONE UNICA DI CHIUSURA GIOCO
  const finishGame = async (isAuto = false) => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    stopTimer();

    if (!game) return;

    const res = await fetch("http://localhost:3001/api/game/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        gameId: game.gameId,
        route,
      }),
    });

    const data = await res.json();

    alert(
      data.valid
        ? `Valid! Score: ${data.score}`
        : `Invalid route`
    );
  };

  const gameStarted = !!game;

  return (
    <div className="game-page">

      {!gameStarted && (
        <div className="setup-buttons">
          <button onClick={() => setMapOpen(true)}>Open Map</button>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      )}

      {gameStarted && (
        <div style={{ display: "flex", width: "100%", height: "calc(100vh - 80px)" }}>

          {/* MAPPA */}
          <div style={{
            flex: 3,
            minHeight: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}>
            <Map
              stations={network.stations}
              segments={network.segments}
              lines={network.lines}
              showLines={false}
            />
          </div>

          {/* SIDEBAR */}
          <div style={{
            flex: 1,
            minHeight: 0,
            borderLeft: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            background: "#fafafa",
          }}>

            {/* TIMER */}
            <div style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              fontWeight: "bold",
              background: "#fff",
            }}>
              ⏱ Time: {time}s
            </div>

            {/* SUBMIT */}
            <div style={{ padding: "10px" }}>
              <button onClick={() => finishGame(false)}>
                Submit
              </button>
            </div>

            {/* ROUTE */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
            }}>
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