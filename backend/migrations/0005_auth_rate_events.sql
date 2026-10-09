-- Short-lived pseudonymous client buckets for passwordless sign-in abuse protection.
-- Raw IP addresses are never stored. Client keys rotate daily and rows are pruned
-- opportunistically after 24 hours.

CREATE TABLE IF NOT EXISTS auth_rate_events (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('LOGIN_REQUEST')),
  client_key TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_events_client_created
  ON auth_rate_events(scope, client_key, created_at);
