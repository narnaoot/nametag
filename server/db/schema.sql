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
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location_updated_at TIMESTAMPTZ,
  tag_color TEXT,
  stickers TEXT,
  tagline TEXT,
  party_code VARCHAR(20),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_lat_idx ON profiles (lat);
CREATE INDEX IF NOT EXISTS profiles_lng_idx ON profiles (lng);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
