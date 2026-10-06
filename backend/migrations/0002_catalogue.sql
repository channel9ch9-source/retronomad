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
