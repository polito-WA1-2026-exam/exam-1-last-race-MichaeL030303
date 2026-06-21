import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("lastrace.db");

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    interchange BOOLEAN NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    color TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS belongs (
    station_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    PRIMARY KEY (station_id, line_id),
    FOREIGN KEY (station_id) REFERENCES stations(id),
    FOREIGN KEY (line_id) REFERENCES lines(id)
  );

  CREATE TABLE IF NOT EXISTS segments (
    station1 INTEGER NOT NULL,
    station2 INTEGER NOT NULL,
    line INTEGER NOT NULL,
    PRIMARY KEY (station1, station2),
    FOREIGN KEY (station1) REFERENCES stations(id),
    FOREIGN KEY (station2) REFERENCES stations(id),
    FOREIGN KEY (line) REFERENCES lines(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    start_station INTEGER NOT NULL,
    end_station INTEGER NOT NULL,
    finished BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (start_station) REFERENCES stations(id),
    FOREIGN KEY (end_station) REFERENCES stations(id)
  );
`);

// Seed users (hashed passwords)
const seedUsers = async () => {
  const users = [
    { username: "Mario", password: "abc1" },
    { username: "Paola", password: "abc2" },
    { username: "Andrea", password: "abc3" },
  ];

  const insert = db.prepare("INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)");

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    insert.run(u.username, hash);
  }
};

// Seed stations
const seedStations = () => {
  db.exec(`
    INSERT OR IGNORE INTO stations (name, interchange) VALUES
    ('Estuary', 0),
    ('Seatown', 0),
    ('Swords Central', 0),
    ('Fosterstown', 0),
    ('Airport', 0),
    ('Northwood', 0),
    ('Ballymun', 0),
    ('Collins Avenue', 0),
    ('Griffith Park', 1),
    ('Glasnevin', 1),
    ('Hospital', 1),
    ('Rotunda', 1),
    ('O''Connell Street', 0),
    ('Tara Street', 1),
    ('Trinity College', 1),
    ('St Stephen''s Green', 0);
  `);
};

// Seed lines
const seedLines = () => {
  db.exec(`
    INSERT OR IGNORE INTO lines (color) VALUES
    ('Red'),
    ('Green'),
    ('Blue'),
    ('Yellow'),
    ('Black');
  `);
};

// Seed belongs (station-line associations)
const seedBelongs = () => {
  db.exec(`
    INSERT OR IGNORE INTO belongs (station_id, line_id) VALUES
    (1, 1), (2, 1), (3, 1), (4, 2), (5, 2), (6, 3), (7, 3), (8, 4),
    (9, 1), (9, 2), (9, 4), (10, 2), (10, 3), (11, 1), (11, 2), (11, 5),
    (12, 1), (12, 3), (13, 5), (14, 4), (14, 5), (15, 1), (15, 4), (16, 5);
  `);
};

// Seed segments
const seedSegments = () => {
  db.exec(`
    INSERT OR IGNORE INTO segments (station1, station2, line) VALUES
    (1, 2, 1), (1, 9, 1), (1, 12, 1), (2, 3, 1), (3, 15, 1),
    (4, 5, 2), (5, 9, 2), (6, 12, 3), (7, 10, 3), (7, 12, 3),
    (8, 9, 4), (8, 14, 4), (9, 10, 2), (10, 11, 2), (11, 12, 1),
    (11, 13, 5), (13, 14, 5), (14, 15, 4), (14, 16, 5);
  `);
};

// Seed events
const seedEvents = () => {
  db.exec(`
    INSERT OR IGNORE INTO events (points, description) VALUES
    (-1, 'Crowded station'),
    (-2, 'No seats available'),
    (-3, 'Train delay'),
    (-4, 'Lost the ticket'),
    (0, 'Almost late'),
    (1, 'Found a coin'),
    (2, 'Good air conditioning'),
    (3, 'Friendly staff'),
    (4, 'Smooth ride');
  `);
};

const seedGames = () => {
db.exec(`
  INSERT INTO games (user_id, score, start_station, end_station, finished)
  VALUES
  (1, 10, 1, 16, 1),
  (1, 12, 1, 16, 1),
  (2, 8, 2, 15, 1);
`);
};
// Run all seeds on startup
const initializeDatabase = async () => {
  try {
    seedStations();
    seedLines();
    seedBelongs();
    seedSegments();
    seedEvents();
    await seedUsers();
    console.log("✓ Database initialized and seeded");
    seedGames();
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

initializeDatabase();

export default db;