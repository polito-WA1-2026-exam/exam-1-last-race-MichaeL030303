import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/", (req, res) => {
  const ranking = db.prepare(`
    SELECT
      users.username,
      COALESCE(MAX(games.score), 0) AS bestScore
    FROM users
    JOIN games ON users.id = games.user_id
    GROUP BY users.id
    ORDER BY bestScore DESC
  `).all();

  res.json(ranking);
});

router.get("/me", (req, res) => {
  if (!req.user)
    return res.status(401).end();

  const best = db.prepare(`
    SELECT COALESCE(MAX(score), 0) AS bestScore
    FROM games
    WHERE user_id = ?
  `).get(req.user.id);

  res.json(best);
});

export default router;