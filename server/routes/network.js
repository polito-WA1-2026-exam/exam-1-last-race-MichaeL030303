// filepath: server/routes/network.js
import express from "express";
import db from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  const stations = db.prepare("SELECT id, name, interchange FROM stations").all();
  const lines = db.prepare("SELECT id, color FROM lines").all();
  const segments = db.prepare("SELECT station1, station2, line FROM segments").all();
  res.json({ stations, lines, segments });
});

export default router;