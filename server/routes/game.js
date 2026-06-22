import express from "express";
import db from "../db.js";
import { distances } from "../utils/graph.js";
import validateRoute from "../utils/validateRoute.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const STARTING_COINS = 20;

const getRandomEvent = () =>
  db.prepare("SELECT id, description, points FROM events ORDER BY RANDOM() LIMIT 1").get();


router.use(requireAuth);

// POST /api/game/start - Start a new game
router.post("/start", (req, res) => {
  try {
    const stations = db.prepare("SELECT id, name, interchange FROM stations").all();

    if (stations.length < 2) {
      return res.status(500).json({ error: "Not enough stations in database" });
    }

    let start;
    let end;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      start = stations[Math.floor(Math.random() * stations.length)];
      const possibleEnds = stations.filter(
        (s) => s.id !== start.id && distances[start.id]?.[s.id] >= 3
      );

      if (possibleEnds.length > 0) {
        end = possibleEnds[Math.floor(Math.random() * possibleEnds.length)];
        break;
      }

      attempts++;
    } while (attempts < maxAttempts);

    if (!end) {
      return res.status(500).json({ error: "Could not generate valid game" });
    }

    const created = db
      .prepare(
        "INSERT INTO games (user_id, score, start_station, end_station, finished) VALUES (?, ?, ?, ?, ?)"
      )
      .run(req.user.id, STARTING_COINS, start.id, end.id, 0);

    res.json({
      gameId: created.lastInsertRowid,
      startStation: start,
      endStation: end,
      coins: STARTING_COINS,
    });
  } catch (error) {
    console.error("POST /start error:", error);
    res.status(500).json({ error: "Failed to start game" });
  }
});

// POST /api/game/submit - Submit and validate a route
router.post("/submit", (req, res) => {
  try {
    const { gameId, route } = req.body;

    if (!gameId) return res.status(400).json({ error: "Missing gameId" });
    if (!Array.isArray(route) || route.length < 2) {
      return res.status(400).json({ error: "Invalid route" });
    }

    const game = db.prepare("SELECT * FROM games WHERE id = ? AND user_id = ?").get(gameId, req.user.id);

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.finished) return res.status(400).json({ error: "Game already finished" });

    const validResult = validateRoute(route, game.start_station, game.end_station);

    if (!validResult.valid) {
      db.prepare("UPDATE games SET score = ?, finished = ? WHERE id = ?").run(0, 1, gameId);

      return res.json({
        valid: false,
        score: 0,
        events: [],
        reason: validResult.reason,
      });
    }

    // Route is valid: calculate score with random events
    let finalScore = game.score ?? STARTING_COINS;
    const events = [];

    for (let i = 0; i < route.length - 1; i += 1) {
      const stationIdA = route[i];
      const stationIdB = route[i + 1];

      const stationA = db.prepare("SELECT id, name FROM stations WHERE id = ?").get(stationIdA);
      const stationB = db.prepare("SELECT id, name FROM stations WHERE id = ?").get(stationIdB);

      if (!stationA || !stationB) {
        return res.status(400).json({ error: "Invalid station in route" });
      }

      const segment = db
        .prepare(
          `SELECT station1, station2, line FROM segments 
           WHERE (station1 = ? AND station2 = ?) OR (station1 = ? AND station2 = ?)`
        )
        .get(stationIdA, stationIdB, stationIdB, stationIdA);

      if (!segment) {
        return res.status(400).json({ error: "Invalid segment in route" });
      }

      const lineInfo = db.prepare("SELECT id, color FROM lines WHERE id = ?").get(segment.line);

      const event = getRandomEvent();
      const points = event?.points ?? 0;
      finalScore += points;

      events.push({
        description: `${stationA.name} → ${stationB.name} (Line ${lineInfo?.id ?? segment.line}) - ${event?.description ?? "No event"}`,
        points,
        eventId: event?.id ?? null,
        lineId: lineInfo?.id ?? null,
      });
    }

    finalScore = Math.max(0, finalScore);

    db.prepare("UPDATE games SET score = ?, finished = ? WHERE id = ?").run(finalScore, 1, gameId);

    res.json({
      valid: true,
      score: finalScore,
      events,
    });
  } catch (error) {
    console.error("POST /submit error:", error);
    res.status(500).json({ error: "Failed to submit game" });
  }
});

// GET /api/game/my-games - Get user's game history (top 10)
router.get("/my-games", (req, res) => {
  try {
    const games = db
      .prepare(
        `SELECT id, score, created_at 
         FROM games 
         WHERE user_id = ? 
         ORDER BY score DESC, created_at DESC 
         LIMIT 10`
      )
      .all(req.user.id);

    res.json(games);
  } catch (error) {
    console.error("GET /my-games error:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

// GET /api/game/:id - Get a specific game (for detail/replay)
router.get("/:id", (req, res) => {
  try {
    const game = db
      .prepare("SELECT * FROM games WHERE id = ? AND user_id = ?")
      .get(req.params.id, req.user.id);

    if (!game) return res.status(404).json({ error: "Game not found" });

    res.json(game);
  } catch (error) {
    console.error("GET /:id error:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

export default router;