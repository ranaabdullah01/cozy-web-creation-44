-- D1 schema for AK Real Estate
-- Apply with: npx wrangler d1 execute ak-realestate --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  beds INTEGER,
  baths INTEGER,
  area INTEGER,
  community TEXT,
  type TEXT,
  image_key TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS communities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_key TEXT
);

CREATE TABLE IF NOT EXISTS offplan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  developer TEXT,
  handover TEXT,
  image_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);
