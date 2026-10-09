# Full Catalogue Architecture v1

Last updated: 6 October 2026

## Purpose

GrailRaven must support a broad searchable catalogue for PlayStation, PlayStation 2 and Dreamcast without pretending that every title already has deep physical-release intelligence.

The architecture therefore separates two different products of data work:

1. **Base catalogue** — game identity and browse/search metadata.
2. **PALScout release intelligence** — exact physical-release evidence such as serials, barcodes, UK/shared-PAL territory, edition and packaging/language evidence.

This separation is mandatory.

## Core rule

A game may exist in the base catalogue even when PALScout has not yet deeply researched its physical releases.

That game can be searched, browsed and saved as a hunt, but exact-copy classification must remain conservative. Missing exact-release evidence must produce REVIEW/unknown behavior rather than guessed MATCH claims.

## Initial seed

The first canonical base catalogue is `catalogue/base-catalogue.json`.

It currently contains the existing pinned validation population:
- PS1: 40
- PS2: 40
- Dreamcast: 20
- Total: 100

These 100 are marked `PALSCOUT_DEEP` because they are backed by the current release-evidence set.

They remain the permanent regression/benchmark population even after the base catalogue expands to thousands of titles.

## Canonical game model

Each base game has:
- stable internal `id`
- canonical `title`
- `platform`
- `aliases`
- optional `releaseYear`
- optional `developer`
- optional `publisher`
- `genres`
- optional rights-aware `artwork`
- `externalRefs` for provider IDs
- `provenance`
- `releaseIntelligence.coverage`

The stable internal ID must not be regenerated merely because display metadata changes. During imports, existing IDs should be preserved whenever an incoming provider record resolves to an existing game.

## Release-intelligence coverage

Allowed values:
- `BASE_ONLY` — searchable catalogue identity, no meaningful PALScout exact-release research yet
- `PALSCOUT_PARTIAL` — some physical-release evidence exists but coverage is incomplete
- `PALSCOUT_DEEP` — sufficiently researched for the deep validation set / strong exact-release logic

Coverage is not a quality score for the game itself. It only describes GrailRaven's release-intelligence depth.

## Public browser index

The full canonical record should not be shipped wholesale to every browser page.

`scripts/build-catalogue.mjs` and the Cloudflare build produce a compact `catalogue-index.js` containing:
- id
- title
- platform
- aliases
- release year
- release-intelligence coverage
- optional public artwork payload, only when explicitly enabled and rights-approved

The optional artwork payload is limited to:
- kind
- source
- sourceRef
- assetUrl
- rightsStatus
- attribution

The Search and Catalogue pages consume this compact index.

Artwork is subject to a double gate:
1. canonical artwork must have `rightsStatus: APPROVED`
2. `CATALOGUE_ARTWORK_ENABLED` must be true at build/runtime

If either condition is false, artwork is omitted from the compact public index rather than merely hidden with CSS.

This means catalogue metadata can grow without forcing artwork/provenance/provider payloads into every page load.

## D1 production mirror

Migration `backend/migrations/0002_catalogue.sql` adds normalized production tables for:
- catalogue games
- aliases
- external provider references
- artwork rights/attribution
- import audit runs

The repository dataset/import pipeline remains the auditable source used to build and validate catalogue releases; D1 is the query/deployment mirror for production.

A D1 sync/import command should be added only after the first external full-catalogue source is selected.

## Import policy

No external source is automatically trusted as canonical.

Each provider import must:
1. identify its source and provider ID
2. map platform explicitly
3. normalize titles without destroying the original title
4. merge by strong provider mapping first
5. use title/platform matching only as a candidate, not silent proof
6. flag collisions/ambiguous duplicates for review
7. preserve provenance
8. never overwrite PALScout release evidence with weaker generic metadata

## Artwork policy

Artwork is a separate rights-aware field.

Do not scrape or hotlink random game covers merely to make the catalogue look complete.

Artwork records must carry:
- source
- URL or stored asset reference
- rights status
- attribution when required

Until an approved artwork source is chosen, `artwork` remains null and the UI may use placeholders.

## Search behavior

The base catalogue is responsible for recognizing the game the user means.

PALScout is responsible for judging a candidate physical copy.

Therefore a search target for a `BASE_ONLY` game is valid, but candidate marketplace listings should remain REVIEW when the app lacks the evidence needed to prove exact territory/edition/completeness requirements.

## Data-source selection

The next catalogue task is to evaluate legitimate data sources for:
- complete PS1 title coverage
- complete PS2 title coverage
- complete Dreamcast title coverage
- canonical titles and aliases
- year/developer/publisher metadata
- region/release metadata, if licensed
- cover artwork and its usage terms

Do not commit a provider-specific dependency into the core schema. Provider adapters should populate this model.

## Expansion sequence

1. Architecture + 100-game seed — implemented.
2. Evaluate full-catalogue metadata/artwork sources and usage rights.
3. Select one primary base source plus optional supplemental sources.
4. Build source-specific importer(s).
5. Run dry imports and review collisions/duplicates.
6. Expand base catalogue platform by platform.
7. Add a public Catalogue browsing page.
8. Increment PALScout release coverage independently, prioritizing high-interest/high-value games.


## Catalogue source evaluation

Current source research and recommendation are recorded in `CATALOGUE_SOURCE_EVALUATION.md`.

Current first candidate to benchmark: **IGDB**.

Do not import a full external catalogue until its coverage/duplicate behavior has been measured against the pinned 100-game set.


## Promotion and D1 synchronization

The first external full-catalogue candidate now has a controlled promotion pipeline.

D1 no longer needs destructive in-place replacement for future catalogue releases. Migration `0003_catalogue_datasets.sql` introduces immutable versioned datasets and an active-dataset pointer.

Benefits:
- uploads can be staged and verified before publication
- interrupted imports do not replace the active catalogue
- activation is a small pointer change
- older datasets remain available for D1 rollback
- the repository remains the canonical/auditable source after an approved promotion

See `CATALOGUE_PROMOTION_PIPELINE.md`.

The IGDB-backed full catalogue remains behind the commercial-use publication gate until that relationship is clarified.


## Public Catalogue UI v1 — 9 October 2026

The public catalogue browser is now deployed at `catalogue.html`.

The UI consumes the compact generated `catalogue-index.js`, not full provider records.

Browse behaviour:
- filters by PS1 / PS2 / Dreamcast
- searches title and aliases through the shared catalogue-search core
- supports alphabetical and release-year sorting
- renders at most 36 game cards per page
- uses canonical game IDs for detail/deep-link identity

Detail route:
`catalogue.html?game=<canonical-id>`

Search route:
`search.html?game=<canonical-id>`

Save route:
`search.html?game=<canonical-id>&save=1`

Search targets now carry `catalogueId`, and Saved Hunts preserve it locally and through server normalization. This protects identity when future provider datasets contain same-title records that cannot safely be represented by title/platform alone.

Artwork remains intentionally absent. The public detail view uses a neutral platform placeholder until artwork rights are explicitly resolved.

Production deployment run: `37931462039`
Cloudflare Worker version: `fcb48b67-9d57-4e64-9678-3099d3e3cef5`

The production publication gate verified exactly 100 PALScout-deep records. The 8,433-game IGDB-backed candidate remains unpublished.


### Dormant artwork UI slots — 9 October 2026

Artwork-capable UI is now deployed but disabled.

Prepared surfaces:
- Catalogue browse-card cover image
- Catalogue detail artwork
- Search hero game artwork
- attribution text hooks
- graceful fallback to existing neutral/platform treatment

Current production flag:
`CATALOGUE_ARTWORK_ENABLED=false`

Current public artwork count:
`0`

Successful guarded deployment:
- run: `37933535039`
- tests: `44/44`
- Worker version: `83e320e4-c37a-4c60-969b-c6e6f8b82b61`

The live UI therefore remains visually unchanged until artwork rights are confirmed and the flag is deliberately enabled.
