// filepath: server/routes/ranking.js
import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";
const router = express.Router();

router.use(requireAuth);

router.get("/", (req, res) => {
  const ranking = db
    .prepare(
      `SELECT games.id, users.username, games.score, games.created_at
       FROM games
       JOIN users ON users.id = games.user_id
       ORDER BY games.score DESC, games.created_at DESC
       LIMIT 10`
    )
    .all();
  res.json(ranking);
});

export default router;