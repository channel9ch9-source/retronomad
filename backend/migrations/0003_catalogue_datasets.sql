-- Catalogue dataset v2.
-- Immutable versioned catalogue snapshots with an atomic active-dataset pointer.
-- Existing v1 catalogue tables remain in place for backwards compatibility.

CREATE TABLE IF NOT EXISTS catalogue_datasets (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  checksum_sha256 TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  game_count INTEGER NOT NULL,
  alias_count INTEGER NOT NULL,
  external_ref_count INTEGER NOT NULL,
  artwork_count INTEGER NOT NULL,
  manifest_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS catalogue_v2_games (
  dataset_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
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
  PRIMARY KEY (dataset_id, game_id),
  FOREIGN KEY (dataset_id) REFERENCES catalogue_datasets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_games_lookup
  ON catalogue_v2_games(dataset_id, platform, title_norm);

CREATE TABLE IF NOT EXISTS catalogue_v2_aliases (
  dataset_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  alias_display TEXT NOT NULL,
  alias_norm TEXT NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (dataset_id, game_id, alias_norm),
  FOREIGN KEY (dataset_id, game_id)
    REFERENCES catalogue_v2_games(dataset_id, game_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_aliases_lookup
  ON catalogue_v2_aliases(dataset_id, alias_norm, game_id);

CREATE TABLE IF NOT EXISTS catalogue_v2_external_refs (
  dataset_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  canonical_url TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (dataset_id, game_id, provider, external_id),
  FOREIGN KEY (dataset_id, game_id)
    REFERENCES catalogue_v2_games(dataset_id, game_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_external_refs_game
  ON catalogue_v2_external_refs(dataset_id, game_id, provider);

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_external_refs_provider
  ON catalogue_v2_external_refs(dataset_id, provider, external_id);

CREATE TABLE IF NOT EXISTS catalogue_v2_artwork (
  dataset_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'COVER',
  source TEXT NOT NULL,
  source_ref TEXT,
  asset_url TEXT NOT NULL,
  rights_status TEXT NOT NULL CHECK (rights_status IN ('APPROVED','PENDING','DO_NOT_USE')),
  attribution TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY (dataset_id, game_id, kind, source),
  FOREIGN KEY (dataset_id, game_id)
    REFERENCES catalogue_v2_games(dataset_id, game_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS catalogue_active_dataset (
  singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
  dataset_id TEXT NOT NULL,
  activated_at TEXT NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES catalogue_datasets(id)
);
