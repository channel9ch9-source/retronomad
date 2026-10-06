-- RetroNomad alerts/backend v1 persistence schema
-- SQLite / Cloudflare D1 compatible.
-- Includes passwordless account/session tables and Saved Hunt sync state.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email_norm TEXT NOT NULL UNIQUE,
  email_display TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id TEXT PRIMARY KEY,
  email_norm TEXT NOT NULL,
  email_display TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('LOGIN')),
  return_to TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_email
  ON auth_tokens(email_norm, expires_at);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id, expires_at);

CREATE TABLE IF NOT EXISTS saved_hunts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL DEFAULT 1,
  label TEXT NOT NULL,
  target_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','PAUSED','ARCHIVED')),
  alert_requested INTEGER NOT NULL DEFAULT 0 CHECK (alert_requested IN (0,1)),
  created_at TEXT NOT NULL,
  client_updated_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  last_checked_at TEXT,
  last_check_json TEXT,
  next_check_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_saved_hunts_owner
  ON saved_hunts(owner_id, deleted_at, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_hunts_due
  ON saved_hunts(status, alert_requested, next_check_at);

CREATE TABLE IF NOT EXISTS hunt_matches (
  hunt_id TEXT NOT NULL,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  delivered_gbp REAL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  last_match_state TEXT NOT NULL CHECK (last_match_state IN ('MATCH')),
  notified_at TEXT,
  PRIMARY KEY (hunt_id, source, external_id),
  FOREIGN KEY (hunt_id) REFERENCES saved_hunts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_hunt_matches_unnotified
  ON hunt_matches(hunt_id, notified_at, first_seen_at);

CREATE TABLE IF NOT EXISTS monitor_runs (
  id TEXT PRIMARY KEY,
  hunt_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  provider_count INTEGER NOT NULL DEFAULT 0,
  candidate_count INTEGER NOT NULL DEFAULT 0,
  match_count INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  filtered_count INTEGER NOT NULL DEFAULT 0,
  new_match_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('RUNNING','SUCCESS','PROVIDER_UNAVAILABLE','FAILED')),
  error_code TEXT,
  error_message TEXT,
  FOREIGN KEY (hunt_id) REFERENCES saved_hunts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monitor_runs_hunt
  ON monitor_runs(hunt_id, started_at DESC);

CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  hunt_id TEXT NOT NULL,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  channel TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempted_at TEXT,
  sent_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','SENT','FAILED','BLOCKED')),
  failure_reason TEXT,
  UNIQUE (hunt_id, source, external_id),
  FOREIGN KEY (hunt_id) REFERENCES saved_hunts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_pending
  ON notification_queue(status, created_at);


-- Base catalogue / metadata layer (separate from PALScout release evidence)
-- Full base catalogue architecture.
-- Base game identity is separate from PALScout exact-release evidence.

CREATE TABLE IF NOT EXISTS catalogue_games (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('PS1','PS2','Dreamcast')),
  title TEXT NOT NULL,
  title_norm TEXT NOT NULL,
  release_year INTEGER,
  developer TEXT,
  publisher TEXT,
  genres_json TEXT NOT NULL DEFAULT '[]',
  release_coverage TEXT NOT NULL DEFAULT 'BASE_ONLY'
    CHECK (release_coverage IN ('BASE_ONLY','PALSCOUT_PARTIAL','PALSCOUT_DEEP')),
  provenance_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalogue_games_platform_title
  ON catalogue_games(platform, title_norm);

CREATE TABLE IF NOT EXISTS catalogue_aliases (
  game_id TEXT NOT NULL,
  alias_display TEXT NOT NULL,
  alias_norm TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (game_id, alias_norm),
  FOREIGN KEY (game_id) REFERENCES catalogue_games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalogue_aliases_norm
  ON catalogue_aliases(alias_norm, game_id);

CREATE TABLE IF NOT EXISTS catalogue_external_refs (
  game_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  canonical_url TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (provider, external_id),
  FOREIGN KEY (game_id) REFERENCES catalogue_games(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalogue_external_refs_game
  ON catalogue_external_refs(game_id, provider);

CREATE TABLE IF NOT EXISTS catalogue_artwork (
  game_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'COVER',
  source TEXT NOT NULL,
  source_ref TEXT,
  asset_url TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status IN ('APPROVED','PENDING','DO_NOT_USE')),
  attribution TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL,
  PRIMARY KEY (game_id, kind, source),
  FOREIGN KEY (game_id) REFERENCES catalogue_games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS catalogue_import_runs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('RUNNING','SUCCESS','REVIEW_REQUIRED','FAILED')),
  input_count INTEGER NOT NULL DEFAULT 0,
  inserted_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  report_json TEXT NOT NULL DEFAULT '{}'
);
