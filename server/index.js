import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import "./auth.js";
import authRoutes from "./routes/auth.js";
import db from "./db.js";
import rankingRouter from "./routes/ranking.js";

const app = express();
const port = 3001;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);
app.use("/api/auth", authRouter);
app.use("/api/game", gameRouter);
app.use("/api/ranking", rankingRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Server OK");
});