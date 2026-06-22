import { createContext, useContext, useRef, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [game, setGame] = useState(null);
  const [time, setTime] = useState(90);
  const [phase, setPhase] = useState("idle"); 
  // idle | playing | finished

  const intervalRef = useRef(null);
  const finishedRef = useRef(false);

  // ================= START GAME =================
  const startGame = async () => {
    try {
      setPhase("playing");
      setTime(90);
      finishedRef.current = false;

      stopTimer();

      const res = await fetch("http://localhost:3001/api/game/start", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setGame(data);

      startTimer();
      return data;
    } catch (err) {
      console.error("startGame error:", err);
      setPhase("idle");
    }
  };

  // ================= TIMER =================
  const startTimer = () => {
    stopTimer();

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (finishedRef.current) return prev;

        if (prev <= 1) {
          finishByTimer();
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

  // ================= SUBMIT GAME =================
  const submitGame = async (route) => {
    if (finishedRef.current) return null;
    if (!game) return null;

    finishedRef.current = true;
    stopTimer();

    setPhase("finished");

    try {
      const res = await fetch("http://localhost:3001/api/game/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          gameId: game.gameId ?? game.id,
          route,
        }),
      });

      const data = await res.json();

      setGame(null);
      return data;
    } catch (err) {
      console.error("submitGame error:", err);
      return null;
    }
  };

  // ================= TIMER END =================
  const finishByTimer = () => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    stopTimer();

    setPhase("finished");
    setGame(null);
  };

  // ================= RESET =================
  const resetGame = () => {
    stopTimer();
    setGame(null);
    setTime(90);
    setPhase("idle");
    finishedRef.current = false;
  };

  return (
    <GameContext.Provider
      value={{
        game,
        setGame,
        time,
        phase,

        startGame,
        submitGame,
        resetGame,

        finishedRef,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// ✅ FIX ERRORE IMPORT (QUESTO era il tuo problema)
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}