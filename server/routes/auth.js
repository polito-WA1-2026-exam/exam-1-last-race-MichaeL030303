import express from "express";
import passport from "passport";

const router = express.Router();

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

router.get("/session", (req, res) => {
  if (!req.user) return res.status(401).end();
  res.json(req.user);
});

export default router;