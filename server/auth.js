import passport from "passport";
import LocalStrategy from "passport-local";
import db from "./db.js";
import bcrypt from "bcrypt";

const Local = LocalStrategy.Strategy;

passport.use(new Local(
  (username, password, done) => {

    const user = db.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).get(username);

    if (!user) return done(null, false);

    const ok = bcrypt.compareSync(password, user.password);

    if (!ok) return done(null, false);

    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = db.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).get(id);

  done(null, user);
});