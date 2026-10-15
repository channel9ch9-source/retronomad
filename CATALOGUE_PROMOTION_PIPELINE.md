# Catalogue Promotion + D1 Sync Pipeline

> **Owner decision — 15 October 2026 (supersedes rollback suggestion):** Keep GrailRaven's expanded **8,462-game catalogue published**. The owner confirms that IGDB's latest written email gave a go-ahead to proceed with the API and data offering while the DocuSign partnership agreement is prepared. This is the basis for continuing as currently deployed; the **formal signed agreement remains outstanding** and must be reviewed when delivered. **Do not initiate a 100-game rollback, disable the existing catalogue, change `IGDB_COMMERCIAL_APPROVED`, redeploy Cloudflare, change D1, or contact IGDB again solely over this audit.** The audit's historical evidence stays valid; its earlier recommendation to roll back pending signature has been declined. Preserve current expanded catalogue and continue ordinary private QA and partnership follow-up.

> **CRITICAL status correction (15 October 2026):** The full IGDB-backed canonical catalogue was already published on 12 October via [successful promotion run 38300719987](https://github.com/channel9ch9-source/retronomad/actions/runs/38300719987). Dataset `cat-455202e6a4daca830a8b`: **8,462 games** (PS1 3,727 / PS2 4,030 / Dreamcast 705), committed in `fc958b5`, activated in remote D1 and deployed to Cloudflare. [Successful production build/smoke 38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) deployed the same **8,462** on 14 October. Therefore older assertions that only 100 PALScout games are publicly served are **incorrect**. The 100 is the protected PALScout-deep subset. The promotion's `IGDB_COMMERCIAL_APPROVED=true` was observed **on 12 October only**; signed agreement and present flag state remain unverified. See [IGDB_PUBLICATION_AUDIT_2026-10-15.md](IGDB_PUBLICATION_AUDIT_2026-10-15.md). **No further public promotion or rollback without licensing assessment and explicit authorisation.**

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


## IGDB partnership status — 7 October 2026

IGDB responded positively and confirmed that commercial partnership access remains free, local storage is allowed/preferred, retrieved data may be retained after termination, Data Dumps will be enabled for the partnered ClientID, and user-facing attribution to IGDB.com is required.

The publication gate remains closed only because the legal partnership agreement still needs to be prepared and signed.

Do not set `IGDB_COMMERCIAL_APPROVED=true` until agreement execution/confirmation is received and any additional conditions are recorded.


Partnership details were sent to IGDB on 7 October 2026. The next external dependency is receipt of the legal agreement. The production publication gate remains closed until agreement execution/confirmation.


## 15 October 2026 — actual public publication verified by Actions records

> **CRITICAL status correction (15 October 2026):** The full IGDB-backed canonical catalogue was already published on 12 October via [successful promotion run 38300719987](https://github.com/channel9ch9-source/retronomad/actions/runs/38300719987). Dataset `cat-455202e6a4daca830a8b`: **8,462 games** (PS1 3,727 / PS2 4,030 / Dreamcast 705), committed in `fc958b5`, activated in remote D1 and deployed to Cloudflare. [Successful production build/smoke 38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) deployed the same **8,462** on 14 October. Therefore older assertions that only 100 PALScout games are publicly served are **incorrect**. The 100 is the protected PALScout-deep subset. The promotion's `IGDB_COMMERCIAL_APPROVED=true` was observed **on 12 October only**; signed agreement and present flag state remain unverified. See [IGDB_PUBLICATION_AUDIT_2026-10-15.md](IGDB_PUBLICATION_AUDIT_2026-10-15.md). **No further public promotion or rollback without licensing assessment and explicit authorisation.**

**Owner decision (15 October):** preserve the already-published 8,462-game catalogue under IGDB's written go-ahead to proceed integrating its API/data while legal prepares the DocuSign agreement. Do not perform a 100-game rollback or adjust the existing approval flag. Await the DocuSign terms for review, keep existing review holds, and continue private testing. Older provisional rollback suggestions are superseded.
