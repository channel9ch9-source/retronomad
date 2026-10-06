# IGDB Full Catalogue Dry Import

This is the first end-to-end proposed full-catalogue import from IGDB.

It is intentionally non-destructive:
- it does not overwrite `catalogue/base-catalogue.json`
- it does not write to D1
- it does not change PALScout release-intelligence coverage
- it does not import IGDB artwork into the live catalogue

## Provider filtering

The dry importer applies the corrected IGDB provider filter:
- include candidates: Main Game, Port, Remake, Remaster, Expanded Game, Standalone Expansion
- review: Bundle, Expansion, Fork, Unknown/unrecognised game types
- exclude: Mods, Pack/Addons, DLC/Add-ons, Episodes, Seasons, Updates
- exclude provider versions carrying `version_parent`

## Same-title collisions

Provider rows are grouped by normalized canonical title within a platform.

- a single provider row is eligible
- if multiple rows share a title and exactly one is `Main Game`, that main-game record is selected for the base identity and the others are reported
- otherwise the entire same-title group is held for review

This is a base-catalogue identity decision only. It does not erase the possibility that a held record represents a meaningful collector edition/release that PALScout may model separately.

## Existing 100 PALScout seed games

The current 100 seed records remain authoritative for their stable internal IDs and release-intelligence state.

The importer attempts conservative provider enrichment:
- exact seed title to provider canonical title is strongest
- seed alias to provider canonical title is next
- provider alternative-name to seed title follows
- alias-to-alias is weakest

Each seed may receive at most one automatically selected IGDB record. If provider rows tie or collide, the mapping is held for review.

A successful seed mapping may add:
- IGDB external ID
- aliases
- year
- developer
- publisher
- genres
- IGDB dry-run provenance

It may not change `PALSCOUT_DEEP` to any other state.

## New games

New provider records receive:
- stable GrailRaven-style ID generated from platform + title
- provider aliases
- basic metadata
- `externalRefs.igdb`
- `BASE_ONLY` release-intelligence coverage
- no live artwork yet

## Outputs

The workflow uploads:
- `igdb-dry-import-proposed-YYYY-MM-DD.json` — proposed complete catalogue
- `igdb-dry-import-review-YYYY-MM-DD.json` — counts, collisions, held rows and unmapped seed games

The proposed file is an artifact for review, not the canonical catalogue.


## Invalid provider dates

Provider release dates are not trusted blindly.

If an IGDB `first_release_date` resolves to a year outside the canonical catalogue's allowed 1980–2100 range:
- `releaseYear` becomes `null`
- the raw anomalous year is recorded in `review.invalidReleaseYears`
- the anomaly does not crash the entire dry import

The workflow uploads available diagnostic artifacts even if a later validation error occurs.
