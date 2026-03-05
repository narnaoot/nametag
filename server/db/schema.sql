CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  pronouns TEXT NOT NULL,
  photo_path TEXT,
  radius_meters INTEGER DEFAULT 100,
  always_visible BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT FALSE,
  location GEOGRAPHY(Point, 4326),
  location_updated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_location_idx ON profiles USING GIST(location);
