# IGDB Deduplication / Filtering Benchmark

This read-only benchmark is the next gate before any full catalogue dry import.

IGDB's platform populations include more than one kind of record. The benchmark therefore inspects:
- `version_parent`
- `version_title`
- `game_type.type`
- `parent_game`

Current provisional buckets:

**Exclude version**
- any record with `version_parent`

**Exclude non-base**
- DLC/add-on
- mod
- episode
- season
- pack
- update

**Review rather than auto-include**
- bundle
- expansion

**Include candidate**
- main game
- port
- remake
- remaster
- expanded game
- standalone expansion
- unknown/unclassified records are retained for measurement rather than silently deleted

These rules are intentionally conservative and are not yet the production importer.

The benchmark re-tests the pinned 100 titles both before and after filtering to measure whether editions/duplicate records are the cause of exact-name ambiguity.

No canonical catalogue or D1 data is modified.
