import express from "express";
import passport from "passport";

const router = express.Router();

// POST /api/auth/login - Authenticate user with username/password
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) return res.status(500).json({ error: "Auth error" });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Login failed" });

      // 🔥 QUESTO È FONDAMENTALE
      req.session.save(() => {
        return res.json(user);
      });
    });
  })(req, res, next);
});

// POST /api/auth/logout - Logout user and destroy session
router.post("/logout", (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);
          return res.status(500).json({ error: "Session destroy failed" });
        }

        res.clearCookie("connect.sid");
        res.json({ ok: true });
      });
    });
  } catch (error) {
    console.error("Unexpected error in logout:", error);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

// GET /api/auth/session - Check current session and return user info
router.get("/session", (req, res) => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.json(null);
    }

    res.json({
      id: req.user.id,
      username: req.user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

export default router;