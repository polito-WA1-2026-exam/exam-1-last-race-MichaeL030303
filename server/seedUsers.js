import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("lastrace.db");

const users = [
  ["Mario", "abc1"],
  ["Paola", "abc2"],
  ["Andrea", "abc3"]
];

const userStmt = db.prepare(
  "INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)"
);

for (const [username, password] of users) {
  const hash = bcrypt.hashSync(password, 10);
  userStmt.run(username, hash);
}

const mario = db.prepare(
  "SELECT id FROM users WHERE username=?"
).get("Mario");

const paola = db.prepare(
  "SELECT id FROM users WHERE username=?"
).get("Paola");

const gameStmt = db.prepare(`
  INSERT OR IGNORE INTO games
  (user_id, score, start_station, end_station)
  VALUES (?, ?, ?, ?)
`);

gameStmt.run(mario.id, 11, 10, 3);
gameStmt.run(mario.id, 21, 4, 11);
gameStmt.run(paola.id, 30, 6, 13);