// filepath: server/auth.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./db.js";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user) return done(null, false);
      const ok = await bcrypt.compare(password, user.password);
      console.log(user);
      if (!ok) return done(null, false);
      return done(null, { id: user.id, username: user.username });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare("SELECT id, username FROM users WHERE id = ?").get(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});