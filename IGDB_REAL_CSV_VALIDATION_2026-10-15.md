# GrailRaven IGDB real CSV full-join validation — 15 October 2026

**Result: PASS on actual complete partner Data Dumps. Private only; not a catalogue promotion.**

Evidence:
- [Live limited-prefix Data Dump format probe, run 38777510750](https://github.com/channel9ch9-source/retronomad/actions/runs/38777510750): passed all nine essential CSV tables with current partner credentials; found PostgreSQL-style `{123,456}` numeric ID arrays, ISO-like date strings, and numeric game type references. No raw rows or signed URLs logged.
- [Complete nine-table real CSV relationship check, run 38779044747](https://github.com/channel9ch9-source/retronomad/actions/runs/38779044747): **SUCCESS**, regression tests green, all nine real CSV files downloaded to an ephemeral GitHub runner, streamed and joined privately, temporary CSVs deleted after completion, aggregate counts printed; no artifact containing licensed raw data.
- Source code: `shared/igdb-dump-csv.js`, `shared/igdb-dump-relations.js`, `shared/igdb-dump-enrichment.js`; private runner `scripts/igdb-private-full-dump-join.mjs`, workflow `.github/workflows/igdb-private-full-join.yml`, regressions `tests/igdb-dump-enrichment.test.mjs`.

## Nine real tables processed

`games`, `release_dates`, `covers`, `alternative_names`, `game_types`, `platforms`, `genres`, `involved_companies`, `companies`.

Total downloaded internally: **493 MiB rounded**; private file cleanup confirmed.

## Aggregate audit results

- **382,264** IGDB game records scanned
- **8,722** distinct IGDB game records attached to at least one of PS1/PS2/Dreamcast
- Per-platform attachment counts (overlap possible; NOT additive unique game total):
  - PlayStation: **3,977**, with platform release year **3,814**, cover metadata **3,874**, alternative names **2,082**
  - PlayStation 2: **4,314**, with release year **4,145**, cover metadata **4,271**, alternative names **2,242**
  - Dreamcast: **740**, with release year **679**, cover metadata **722**, alternative names **433**
- **594,030** release-date entries scanned; **12,624** linked to those platform games
- **346,350** cover entries scanned; **8,559** primary-cover matches using the explicitly referenced cover ID
- **209,228** alternative-name entries scanned; **8,775** relevant unique aliases matched
- **17,018** game-company role relationships linked
- **0** unresolved game-type refs, **0** missing genre refs, **0** missing involved-company relations, **0** missing company names (within selected records)

**Conservative game-type buckets of the 8,722 selected records:**
- INCLUDE_CANDIDATE: **8,235**
- EXCLUDE_VERSION: **76**
- EXCLUDE_NON_BASE (DLC / mod / update etc.): **133**
- REVIEW (bundles, expansion, unknown, etc.): **278**

The four counts total 8,722. These are **provider game records, not countable physical exact releases** or currently purchasable marketplace listings.

## Actual format fixes required

- PostgreSQL-style numeric arrays with braces, not JSON square brackets.
- Date strings instead of Unix timestamp values in `release_dates.date`.
- `game_types` legitimately uses **type ID 0**; only the game-type reference validator permits zero. Other IGDB identifiers remain strictly positive.
- Joined publisher/developer roles must resolve through `involved_companies -> companies`; explicit cover must match a game's own cover ref.
- Regression fixtures now cover these semantics.

## Unresolved publication work

This passes the **real CSV structural/relationship validation gate**. It does NOT complete the public catalogue replacement:
1. The existing API-based 8,433-game candidate has different filtering, deduplication, PALScout seed preservation and collision logic. **8,235 candidate provider records must not be assumed to equal 8,433 canonical game/platform rows**; a deterministic private parity benchmark should resolve the difference before changing production.
2. Full legal IGDB partnership agreement is **still pending**; no change to `IGDB_COMMERCIAL_APPROVED`, canonical catalogue, D1, public artwork or site.
3. Additional IGDB table relationships, updates, and artwork rights must conform to the signed agreement and retained provider-metadata rules; exact physical-copy intelligence remains PALScout plus authorised marketplace data.

The private workflow has no schedule. No additional subscription or manual Cloudflare deploy is necessary. A separate optional manual nine-table Actions audit may also exist in the repository; the above successful run is already the authoritative full real-file validation.
