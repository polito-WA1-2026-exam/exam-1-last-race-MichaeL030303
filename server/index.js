import express from "express";
import cors from "cors";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import passport from "passport";
import db from "./db.js";
import authRouter from "./routes/auth.js";
import gameRouter from "./routes/game.js";
import networkRouter from "./routes/network.js";
import rankingRouter from "./routes/ranking.js";
import "./auth.js";

const app = express();
const SQLiteStore = SQLiteStoreFactory(session);

const store = new SQLiteStore({
  db: "sessions.sqlite",
  dir: "./",
});
// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(
  session({
    store,
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRouter);
app.use("/api/game", gameRouter);
app.use("/api/network", networkRouter);
app.use("/api/ranking", rankingRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Last Race API running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});