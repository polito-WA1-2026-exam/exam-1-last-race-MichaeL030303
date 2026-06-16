import express from "express";
import db from "../db.js";
import { distances } from "../utils/graph.js";

const router = express.Router();

router.post("/start", (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).end();

  const stations = db.prepare("SELECT * FROM stations").all();

  let start, end;

  do {
    start = stations[Math.floor(Math.random() * stations.length)];
    end = stations[Math.floor(Math.random() * stations.length)];
  } while (
    start.id === end.id ||
    distances[start.id][end.id] < 3
  );

  const game = db.prepare(`
    INSERT INTO games (user_id, score, start_station, end_station)
    VALUES (?, ?, ?, ?)
  `).run(user.id, 20, start.id, end.id);

  res.json({
    gameId: game.lastInsertRowid,
    startStation: start,
    endStation: end,
    coins: 20
  });
});

export default router;