import Database from "better-sqlite3";

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

  INSERT OR IGNORE INTO stations (name, interchange) VALUES
  ('Estuary', FALSE),
  ('Seatown', FALSE),
  ('Swords Central', FALSE),
  ('Fosterstown', FALSE),
  ('Airport', FALSE),
  ('Northwood', FALSE),
  ('Ballymun', FALSE),
  ('Collins Avenue', FALSE),
  ('Griffith Park', TRUE),
  ('Glasnevin', TRUE),
  ('Hospital', TRUE),
  ('Rotunda', TRUE),
  ('O''Connell Street', FALSE),
  ('Tara Street', TRUE),
  ('Trinity College', TRUE),
  ('St Stephen''s Green', FALSE);

  CREATE TABLE IF NOT EXISTS lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    color TEXT NOT NULL UNIQUE
  );

  INSERT OR IGNORE INTO lines (color) VALUES
  ('Red'),
  ('Green'),
  ('Blue'),
  ('Yellow'),
  ('Black');

  CREATE TABLE IF NOT EXISTS belongs (
    station_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    PRIMARY KEY (station_id, line_id),
    FOREIGN KEY (station_id) REFERENCES stations(id),
    FOREIGN KEY (line_id) REFERENCES lines(id)
  );

  INSERT OR IGNORE INTO belongs (station_id, line_id) VALUES
  (1, 1),
  (2, 1),
  (3, 1),
  (4, 2),
  (5, 2),
  (6, 3),
  (7, 3),
  (8, 4),
  (9, 1),
  (9, 2),
  (9, 4),
  (10, 2),
  (10, 3),
  (11, 1),
  (11, 2),
  (11, 5),
  (12, 1),
  (12, 3),
  (13, 5),
  (14, 4),
  (14, 5),
  (15, 1),
  (15, 4),
  (16, 5);

  CREATE TABLE IF NOT EXISTS segments (
    station1 INTEGER NOT NULL,
    station2 INTEGER NOT NULL,
    PRIMARY KEY (station1, station2),
    FOREIGN KEY (station1) REFERENCES stations(id),
    FOREIGN KEY (station2) REFERENCES stations(id)
  );

  INSERT OR IGNORE INTO segments (station1, station2) VALUES
  (1, 2),
  (1, 9),
  (1, 12),
  (2, 3),
  (3, 15),
  (4, 5),
  (5, 9),
  (6, 12),
  (7, 10),
  (7, 12),
  (8, 9),
  (8, 14),
  (9, 10),
  (10, 11),
  (11, 12),
  (11, 13),
  (13, 14),
  (14, 15),
  (14, 16);

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    points INTEGER NOT NULL,
    description TEXT NOT NULL
  );

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

  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    start_station INTEGER NOT NULL,
    end_station INTEGER NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (start_station) REFERENCES stations(id),
    FOREIGN KEY (end_station) REFERENCES stations(id)
  );
`);
export default db;