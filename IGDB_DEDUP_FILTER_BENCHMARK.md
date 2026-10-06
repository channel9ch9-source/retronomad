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


### First-run correction — 6 October 2026

The first successful run exposed a benchmark implementation bug: IGDB returned display labels such as `Main Game`, `Bundle`, `Mod`, and `Pack / Addon`, while the provisional classifier compared some values against lowercase/internal-style names.

As a result, the first run's include/review/exclude counts are not valid as a filtering decision gate.

The classifier has been corrected to normalize IGDB's returned game-type labels before applying rules.

Corrected policy:
- include candidate: Main Game, Port, Remake, Remaster, Expanded Game, Standalone Expansion
- review: Bundle, Expansion, Fork, Unknown, or any unrecognised future type
- exclude non-base: Mod, Pack / Addon, DLC/Add-on, Episode, Season, Update
- exclude version: any record with `version_parent`

The benchmark must be rerun after this correction before any dry import.
