# Catalogue Promotion + D1 Sync Pipeline

Last updated: 6 October 2026

## Purpose

This pipeline prepares GrailRaven to promote the validated full catalogue safely after the IGDB commercial-use gate is cleared.

It deliberately separates four operations:

1. **candidate validation**
2. **immutable D1 staging**
3. **D1 verification**
4. **activation/publication**

Staging is not publication.

## Safety model

The D1 catalogue uses immutable versioned datasets.

Each candidate gets:
- a SHA-256 checksum
- a deterministic dataset ID derived from that checksum
- expected counts for games, aliases, external references and artwork
- a promotion manifest

The staged rows live in versioned `catalogue_v2_*` tables.

The current D1 catalogue is selected by the single row in:
`catalogue_active_dataset`

Activating a new catalogue changes that pointer. Older datasets remain available for rollback.

The legacy catalogue tables remain untouched for backwards compatibility.

## Scripts

### Prepare candidate

`scripts/prepare-catalogue-promotion.mjs`

Checks:
- catalogue schema validity
- preservation of all 100 PALScout deep seed identities
- 100 PALScout deep records in a full candidate
- IGDB mapping on all 100 deep seeds
- minimum platform-population safety floors
- browser search index <= 2 MiB
- globally unique provider external references

Outputs:
- `promotion-output/canonical-candidate.json`
- `promotion-output/manifest.json`

It does not modify the canonical repo catalogue.

### Export D1 dataset

`scripts/export-catalogue-d1.mjs`

Creates idempotent SQL chunks under `promotion-output/d1/`.

The chunks use `INSERT OR IGNORE` into an immutable dataset ID, so an interrupted stage can be resumed safely.

The activation SQL is generated separately as `90-activate.sql` and is never included in the normal staging loop.

### Verify D1 dataset

`scripts/verify-d1-catalogue.mjs`

Checks the staged D1 dataset against the manifest:
- checksum
- game count
- alias count
- external-reference count
- artwork count

With `--expect-active`, it also confirms the active pointer.

### Activate D1 dataset

`scripts/activate-catalogue-dataset.mjs`

Local validation requires:
`CATALOGUE_PROMOTION_CONFIRM=LOCAL_TEST`

Remote activation requires both:
- `IGDB_COMMERCIAL_APPROVED=true`
- `CATALOGUE_PROMOTION_CONFIRM=PROMOTE_IGDB_CATALOGUE`

The remote GitHub workflow adds an additional job-level gate using the repository variable:
`IGDB_COMMERCIAL_APPROVED`

### Rollback

`scripts/rollback-catalogue-dataset.mjs`

A previous immutable D1 dataset can be reactivated by ID.

Remote rollback requires:
`CATALOGUE_ROLLBACK_CONFIRM=ROLLBACK_CATALOGUE`

This changes only the D1 active pointer. If the public static catalogue has also been promoted, a full public rollback additionally requires reverting the canonical catalogue commit and redeploying.

## GitHub Actions

### Validate catalogue promotion pipeline

Safe to run now.

This workflow:
1. regenerates the IGDB dry-run candidate
2. validates it
3. builds the promotion manifest
4. exports D1 SQL
5. creates an isolated local D1 database inside CI
6. stages the entire catalogue locally
7. verifies counts/checksum
8. activates it locally
9. verifies the active pointer

It does not contact production D1 and cannot publish the catalogue.

### Promote approved IGDB catalogue

Do not run until IGDB commercial approval/partnership status is resolved.

Even if manually triggered, the promotion job will not run unless:
- repository variable `IGDB_COMMERCIAL_APPROVED` equals `true`
- the workflow input exactly equals `PROMOTE_IGDB_CATALOGUE`

When both gates are satisfied, it:
1. regenerates and validates a fresh candidate
2. stages the immutable dataset in remote D1
3. verifies it before activation
4. promotes the candidate to `catalogue/base-catalogue.json`
5. regenerates `catalogue-index.js`
6. reruns all tests
7. commits the canonical catalogue to the repo
8. activates the verified D1 dataset
9. builds and deploys the public app

## Publication gate

Until IGDB responds, the current 100-game canonical catalogue remains the public source.

The 8,433-game candidate remains development-only.


### Provider IDs and platform identity

Provider IDs are not globally unique GrailRaven game/platform identities.

For IGDB specifically, one IGDB game record can span multiple platforms. Therefore the same IGDB external ID may legitimately appear on PS1, PS2 and/or Dreamcast canonical rows.

Rules:
- cross-platform reuse of the same provider ID is allowed
- reuse of the same provider ID by two different GrailRaven games on the same platform is a promotion-blocking collision
- D1 stores provider refs under `(dataset_id, game_id, provider, external_id)`
- an additional provider lookup index supports reverse provider-ID lookup

The first safe validation found 291 legitimate cross-platform IGDB-ID reuse groups and zero same-platform collisions.


## Validated end-to-end run — 6 October 2026

Safe workflow run `37540728095` completed successfully.

Validated manifest:
- dataset ID: `cat-3faa2a84ad267ddd017c`
- SHA-256: `3faa2a84ad267ddd017c75cdd1437af9997150a9d8b407a66fd6a56e82703816`
- 8,433 games
- 7,512 aliases
- 8,433 external refs
- 0 artwork rows
- 291 legitimate cross-platform provider-ID reuse groups
- 1.372 MiB compact browser search index
- all 100 PALScout deep seed IDs preserved

The complete candidate was staged into isolated local D1, verified, activated locally and verified again through the active-dataset pointer.

This proves the pipeline mechanics before any remote production promotion. It does not grant permission to publish IGDB data and does not alter the current 100-game public catalogue.


## Search-quality gate

Structural catalogue validation is not sufficient for promotion.

Before D1 staging, the approved promotion workflow runs:
`scripts/benchmark-catalogue-search.mjs`

The benchmark checks representative exact, partial, abbreviation, regional-name, duplicate-platform, ambiguity and typo searches against the full candidate, along with browser-index size and query-time regression budgets.

Failure blocks the promotion workflow.

Search behaviour is documented in `CATALOGUE_SEARCH_V1.md`.
