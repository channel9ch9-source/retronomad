# IGDB Platform Inventory Benchmark

Purpose: inspect the complete IGDB record population attached to PlayStation, PlayStation 2 and Dreamcast before any bulk import into GrailRaven.

This is intentionally read-only.

## What it fetches

For each launch platform:
- all IGDB game records attached to that platform, paged in batches
- canonical name
- alternative names
- IGDB ID
- slug
- first release date
- cover image ID presence

It does not write to `catalogue/base-catalogue.json` or D1.

## Identity rules

Safe automatic benchmark resolution is intentionally strict:
- one exact normalized canonical-name hit -> `EXACT_CANONICAL`
- one exact normalized alternative-name hit -> `EXACT_ALIAS`
- more than one exact record -> `AMBIGUOUS_EXACT`
- no exact canonical/alias record -> `UNRESOLVED`

Roman-numeral normalization and token similarity are used only to generate human-review candidates. They never create a safe automatic match.

This specifically prevents the earlier unsafe behavior where a title such as `Forbidden Siren` could be associated with `Forbidden Siren 2` merely because the names overlap.

## Inventory diagnostics

The report records:
- IGDB raw platform count
- fetched record count
- unique IGDB IDs
- unique normalized canonical-name count
- alias volume
- cover/date coverage
- canonical-name collision groups
- alias collision groups
- up to 50 collision samples per type
- strict re-resolution of the pinned 100-game benchmark
- review candidates for unresolved benchmark rows

## Decision gate

Do not bulk-import until:
1. the complete inventory fetch is reliable
2. the 100-game benchmark has very high exact canonical/alias resolution
3. ambiguous exact collisions are understood
4. obvious non-retail/version noise can be filtered safely
5. importer rules preserve provider provenance and never upgrade PALScout coverage automatically
