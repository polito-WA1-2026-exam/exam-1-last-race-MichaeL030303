import express from "express";
import session from "express-session";
import passport from "passport";
import "./auth.js";
import authRoutes from "./routes/auth.js";
import db from "./db.js";

const app = express();
const port = 3001;

app.use(express.json());

app.use(session({
  secret: "supersecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRoutes);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});