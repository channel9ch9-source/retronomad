# IGDB Data Dump CSV — private offline importer prototype (15 October 2026)

**State:** code committed, synthetic fixture-tested, **NOT YET TESTED AGAINST ACTUAL CSV CONTENT**. There is no new live catalogue data, artwork, API endpoint, D1 write or publication.

## Proven prerequisites

[IGDB Data Dump check run 38743846480](https://github.com/channel9ch9-source/retronomad/actions/runs/38743846480) was green on 15 October 2026:
- 79 dump endpoints were listed for our partner-enabled ClientID.
- `games`, `release_dates`, `covers`, `alternative_names` each returned **SCHEMA_READY** in a private metadata-only check.
- No dump CSV, temporary presigned S3 URL, secret, or raw provider row was retained.

IGDB commercial partnership contract is still being prepared for DocuSign. Do **not** set `IGDB_COMMERCIAL_APPROVED=true`, run `Promote approved IGDB catalogue`, or publish provider artwork/data before legal approval/terms review. IGDB previously said private integration work can proceed in the meantime.

## What is implemented now

- `shared/igdb-dump-csv.js`: streaming UTF-8 CSV parser supporting BOM, multiline quoted fields, escaped double-quotes, commas, CRLF and chunk boundaries, plus strict numeric IGDB reference / JSON-array fields and bounded field lengths. Fails closed on invalid/unknown array encoding and structural errors.
- `shared/igdb-dump-relations.js`: join **four standalone dumps**, using explicit validated IGDB platform IDs to identify PS1/PS2/Dreamcast candidates, same-game alternative names, per-platform earliest known release years and the game-linked cover metadata. This is **not an edition/region classifier**, and ignores unrelated platform records. Date cannot establish UK/US/Japan physical release.
- `scripts/igdb-dump-local-preview.mjs`: explicit-opt-in local CLI reading **existing private CSV files** from local disk, streaming rows rather than loading all CSV text into memory. It **only prints counts** by platform. It does not download provider data, print CSV rows, export exact titles/IDs or create public artifacts.
- `tests/igdb-dump-csv.test.mjs`: private synthetic fixtures test CSV edge cases, streaming, cross-platform date joins, regional aliases (Tomba!/Tombi!), exact cover reference checks and failure on invalid/ambiguous input.

## How to run when privately authorised CSV files are available

These arguments are examples, **not instructions to fetch CSVs from unapproved sources**:

```bash
node scripts/igdb-dump-local-preview.mjs \
  --confirm=PRIVATE_LOCAL_DATA_ONLY \
  --games=/private/dumps/games.csv \
  --release-dates=/private/dumps/release_dates.csv \
  --covers=/private/dumps/covers.csv \
  --alternative-names=/private/dumps/alternative_names.csv \
  --platform-ids=PS1:<verified-id>,PS2:<verified-id>,Dreamcast:<verified-id>
```

Resolve exact IGDB platform IDs from the existing private platform-inventory benchmark or authorised IGDB platform lookup (don't assume retail-region mappings). The CLI output contains only `counts` and `platformStats` plus explicit no-publication flags. Third-party CSVs must **never** be committed to GitHub, uploaded as public Actions artifacts, or disclosed in logs. Re-download URLs are short-lived secrets.

## Why this is NOT the complete bulk CSV catalogue importer yet

- IGDB `game_type` CSV values refer to a separate **game_types** table; unlike our existing API importer, this prototype **cannot yet** identify Main Game vs add-on/mod/expansion or automatically accept games.
- Other full-catalogue fields such as genres, publishers, developers, provider provenance, platform-name resolution and any licence-permitted artwork would need additional tables and relational checks.
- Real IGDB data may use different null or array encoding than our synthetic assumptions. The first private real-file test must inspect these encodings without exposing licensed content; fail on mismatches, then add type-aware compatibility rules based on actual metadata.
- Availability and region/edition/completeness for physical copies come from authorised retailers + PALScout, not from IGDB game metadata.
- Existing **API-based 8,433-game candidate** has already passed a complete dry promotion, D1 staging and search benchmark. Do not replace or overwrite it with the unproven CSV prototype.

## Next engineering gate

1. Privately verify the array / null / timestamp formats in a small real CSV sample or locally downloaded partner dump under their access terms; record **aggregate counts and field-shape flags only**.
2. Add `game_types` lookup and other necessary relationships; compare a fixed selection of PS1, PS2 and Dreamcast games with the existing API importer before expanding.
3. Demonstrate equivalent dedup, preservation of the 100 seed PALScout identities, collision handling and per-platform release-date logic.
4. Only after agreement/sign-off and full promotion review decide whether the CSV importer should power periodic catalogue updates.

**Safety status:** `SYNTHETIC_TESTED / PRIVATE_ONLY / NO_REAL_CSV_TEST / NO_PUBLICATION`.


## Nine-table private real-dump test ready — 15 October 2026

A separate opt-in GitHub workflow now exists: [Private IGDB real CSV relationships](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-private-real-dump-check.yml). This test is **NOT an importer deployment** and must be explicitly launched. It downloads the real nine IGDB partner CSVs into a temporary runner directory, runs the current importer and relationship enrichment, emits only aggregate counts into a 7-day private Actions artifact and deletes the temporary directory.

The nine tables are: `games`, `release_dates`, `covers`, `alternative_names`, `game_types`, `platforms`, `genres`, `involved_companies`, `companies`. The platform IDs are resolved from the private `platforms` dump and cross-checked. Both the stable provider IDs and the game_type/genre/developer/publisher relationships are processed as private data. It flags CSV encoding or relationship mismatches rather than silently publishing anything.

Safety: no API secret, signed S3 URL, raw CSV, title list, provider record or artwork is written to a public artifact or Git commit; no production D1 writes, no catalogue replacement, no approval variable changes; all private downloads are removed at job end. The job has a 55-minute maximum and a per-download size ceiling. Any failure requires review, not relaxing the safety gate. It is possible IGDB uses data representations the fixture importer does not support; if so, we will adapt from **aggregate-only** diagnostics.

**Next manual action:** Run this workflow once from `main` and share whether green or red; then inspect the `igdb-private-csv-aggregate-check` artifact for counts and missing relation totals. Never paste the provider token or presigned download URL into chat.

Legal partnership agreement is still pending; `IGDB_COMMERCIAL_APPROVED` remains closed.
