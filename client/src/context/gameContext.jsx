import { createContext, useContext, useRef, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);

  const [time, setTime] = useState(90);

  const intervalRef = useRef(null);
  const finishedRef = useRef(false); // 🔥 BLOCCO ASSOLUTO

  const startGame = async () => {
    const res = await fetch("http://localhost:3001/api/game/start", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    setGame(data);

    startTimer();
  };

  const startTimer = () => {
    setTime(90);
    finishedRef.current = false;

    stopTimer(); // 🔥 SICUREZZA

    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (finishedRef.current) return prev;

        if (prev <= 1) {
          finishedRef.current = true;
          stopTimer();
          autoFinish();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const submitGame = async (route) => {
    if (finishedRef.current) return null;

    finishedRef.current = true;
    stopTimer();

    if (!game) return null;

    const res = await fetch("http://localhost:3001/api/game/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        gameId: game.gameId,
        route,
      }),
    });

    const data = await res.json();

    return data;
  };

  const autoFinish = async () => {
    // 🔥 IMPORTANTE: qui NON deve chiamare startTimer o re-trigger
    // solo bloccare stato
    console.log("Game finished by timer");
  };

  return (
    <GameContext.Provider value={{
      game,
      setGame,
      startGame,
      submitGame,
      time,
      stopTimer,
      finishedRef
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}