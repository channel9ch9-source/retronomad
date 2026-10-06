-- Correct catalogue v2 provider-reference identity.
-- A provider game ID may legitimately be shared by the same game across
-- multiple platforms. GrailRaven's catalogue identity is platform-specific.

ALTER TABLE catalogue_v2_external_refs RENAME TO catalogue_v2_external_refs_old;

CREATE TABLE catalogue_v2_external_refs (
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

INSERT OR IGNORE INTO catalogue_v2_external_refs
(dataset_id,game_id,provider,external_id,canonical_url,metadata_json)
SELECT dataset_id,game_id,provider,external_id,canonical_url,metadata_json
FROM catalogue_v2_external_refs_old;

DROP TABLE catalogue_v2_external_refs_old;

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_external_refs_game
  ON catalogue_v2_external_refs(dataset_id, game_id, provider);

CREATE INDEX IF NOT EXISTS idx_catalogue_v2_external_refs_provider
  ON catalogue_v2_external_refs(dataset_id, provider, external_id);
