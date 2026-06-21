import { createContext, useContext, useEffect, useRef, useState, useMemo } from "react";
import { startGame as startGameApi, submitGameApi } from "../utils/api.js";
import { AuthContext } from "./authContext.jsx";

const GameContext = createContext();

export function GameProvider({ children }) {
  const auth = useContext(AuthContext);   // 🔥 QUESTO DEVE ESISTERE

  const [game, setGame] = useState(null);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState("idle");

  const finishedRef = useRef(false);
  const timerRef = useRef(null);

  const STARTING_TIME = 90;

  const startGame = async () => {
    if (auth.loading) throw new Error("Auth loading");
    if (!auth.user) throw new Error("User not authenticated");

    finishedRef.current = false;
    setTime(STARTING_TIME);
    setPhase("playing");

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const newGame = await startGameApi();
    setGame(newGame);

    timerRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setPhase("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return newGame;
  };

const submitGame = async (route) => {
  if (finishedRef.current) return null;

  if (!game) throw new Error("No active game");
  if (!Array.isArray(route) || route.length < 2)
    throw new Error("Invalid route");

  finishedRef.current = true;
  setPhase("finished");

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  const gameId = game.gameId ?? game.id;
  const result = await submitGameApi(gameId, route);

  setGame(null);
  return result;
};

const resetGame = () => {
  setGame(null);
  setTime(0);
  setPhase("idle");

  finishedRef.current = false;

  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }
};

  return (
  <GameContext.Provider value={{
    game,
    startGame,
    submitGame,
    resetGame,
    time,
    phase,
    finishedRef
  }}>
    {children}
  </GameContext.Provider>
);
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}