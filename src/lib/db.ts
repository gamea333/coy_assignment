import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type DB = Database.Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  age       INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  bio       TEXT NOT NULL,
  city      TEXT NOT NULL,
  college   TEXT,
  interests TEXT NOT NULL DEFAULT '[]'  -- JSON array
);

CREATE TABLE IF NOT EXISTS swipes (
  swiper_id  INTEGER NOT NULL REFERENCES users(id),
  target_id  INTEGER NOT NULL REFERENCES users(id),
  direction  TEXT NOT NULL CHECK (direction IN ('like','pass')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (swiper_id, target_id),
  CHECK (swiper_id <> target_id)
);

-- One row per pair; user_a is always the smaller id.
CREATE TABLE IF NOT EXISTS matches (
  user_a     INTEGER NOT NULL REFERENCES users(id),
  user_b     INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);
`;

/** Open a DB (":memory:" for tests) and make sure the schema exists. */
export function openDb(file: string): DB {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

const DEFAULT_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "data", "coy.db");

// Reuse one connection across hot reloads in dev.
const g = globalThis as unknown as { __coyDb?: DB };
export function getDb(): DB {
  if (!g.__coyDb) g.__coyDb = openDb(DEFAULT_PATH);
  return g.__coyDb;
}
