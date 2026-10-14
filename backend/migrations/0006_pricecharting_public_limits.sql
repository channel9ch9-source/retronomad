-- Public PriceCharting lookup throttles. No provider payloads, prices, URLs or raw IPs stored.
CREATE TABLE IF NOT EXISTS pricecharting_public_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  valid_until INTEGER NOT NULL
);
