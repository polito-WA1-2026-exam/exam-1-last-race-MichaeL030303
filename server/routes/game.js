import express from "express";
import db from "../db.js";
import { distances } from "../utils/graph.js";
import validateRoute from "../utils/validateRoute.js";

const router = express.Router();

const STARTING_COINS = 20;

router.get("/network", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Not authenticated" });

  const stations = db.prepare(`
    SELECT id, name, interchange
    FROM stations
  `).all();

  const lines = db.prepare(`
    SELECT id, color
    FROM lines
  `).all();

  const segments = db.prepare(`
    SELECT station1, station2, line
    FROM segments
  `).all();

  res.json({ stations, lines, segments });
});

router.post("/start", (req, res) => {
  if (!req.user)
    return res.status(401).end();

  const stations = db.prepare(`
    SELECT id, name, interchange
    FROM stations
  `).all();

  let start, end;

  do {
    start = stations[Math.floor(Math.random() * stations.length)];

    const possibleEnds = stations.filter(
      s =>
        s.id !== start.id &&
        distances[start.id]?.[s.id] >= 3
    );

    if (possibleEnds.length === 0) continue;

    end = possibleEnds[Math.floor(Math.random() * possibleEnds.length)];
  } while (!end);

  const game = db.prepare(`
    INSERT INTO games (user_id, score, start_station, end_station)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, STARTING_COINS, start.id, end.id);

  res.json({
    gameId: game.lastInsertRowid,
    startStation: start,
    endStation: end,
    coins: STARTING_COINS
  });
});

router.post("/submit", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Not authenticated" });

  const { gameId, route } = req.body;

  if (!gameId || !Array.isArray(route))
    return res.status(400).json({ error: "Missing or invalid data" });

  const game = db.prepare(`
    SELECT *
    FROM games
    WHERE id = ? AND user_id = ?
  `).get(gameId, req.user.id);

  if (!game)
    return res.status(404).json({ error: "Game not found" });

  const valid = validateRoute(
    route,
    game.start_station,
    game.end_station
  );

  if (!valid) {
    coins = Math.max(0, coins);

    db.prepare(`
      UPDATE games
      SET score = ?
      WHERE id = ?
    `).run(coins, gameId);

    return res.json({
      valid: false,
      score: coins,
      events: []
    });
  }

  const eventsTable = db.prepare(`
    SELECT *
    FROM events
  `).all();

  let coins = STARTING_COINS;
  const events = [];

  for (let i = 0; i < route.length - 1; i++) {
    const event =
      eventsTable[Math.floor(Math.random() * eventsTable.length)];

    coins += event.points;

    events.push({
      from: route[i],
      to: route[i + 1],
      description: event.description,
      points: event.points,
      coins
    });
  }

  coins = Math.max(0, coins);

  db.prepare(`
    UPDATE games
    SET score = ?
    WHERE id = ?
  `).run(coins, gameId);

  res.json({
    valid: true,
    score: coins,
    events
  });
});


router.get("/my-games", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Not authenticated" });

  const games = db.prepare(`
    SELECT *
    FROM games
    WHERE user_id = ?
    ORDER BY id DESC
  `).all(req.user.id);

  res.json(games);
});

router.get("/:id", (req, res) => {
  if (!req.user)
    return res.status(401).json({ error: "Not authenticated" });

  const game = db.prepare(`
    SELECT *
    FROM games
    WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id);

  if (!game)
    return res.status(404).json({ error: "Game not found" });

  res.json(game);
});

export default router;