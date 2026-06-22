// filepath: server/seedUsers.js
import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("lastrace.db");
const users = [
  { username: "Mario", password: "abc1" },
  { username: "Paola", password: "abc2" },
  { username: "Andrea", password: "abc3" },
];

const insert = db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)");

(async () => {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    insert.run(u.username, hash);
  }
  console.log("seed users done");
})();
const gameStmt = db.prepare(`
  INSERT OR IGNORE INTO games
  (user_id, score, start_station, end_station, finished, created_at)
  VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
`);

gameStmt.run(mario.id, 11, 10, 3);
gameStmt.run(mario.id, 21, 4, 11);
gameStmt.run(paola.id, 30, 6, 13);