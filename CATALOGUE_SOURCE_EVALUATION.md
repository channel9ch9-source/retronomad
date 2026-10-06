# Catalogue Source Evaluation

Last updated: 6 October 2026

Purpose: choose legitimate data sources for the full PS1 / PS2 / Dreamcast base catalogue and, separately, cover artwork.

This is a sourcing decision, not a PALScout decision. External catalogue providers may supply broad metadata, but they do not become the authority for exact physical-release identity.

## Current shortlist

### IGDB — strongest current primary candidate

Official API documentation:
https://api-docs.igdb.com/

Current documented position:
- Current IGDB documentation says the API is free for non-commercial usage.
- Commercial needs should go through IGDB's commercial partnership process.
- Do not assume commercial production use is free or automatically covered.
- User-facing IGDB attribution is expected for commercial integrations.
- Local storage/caching is explicitly allowed and preferred.
- API exposes games, platforms, alternative names, release dates, companies, covers, localizations and other useful metadata.
- Cover/image endpoints are part of the API.

Why it fits GrailRaven:
- development/coverage validation can proceed without another paid subscription right now
- designed to be cached into our own database
- broad general game catalogue
- stable external IDs can be stored in `externalRefs`
- cover images can be represented in the rights-aware artwork layer
- data is broad enough for base catalogue while PALScout remains exact-release authority

Open checks before production use:
- measure actual PS1 / PS2 / Dreamcast coverage and duplicates
- verify how well regional/localized releases map to GrailRaven's base-game model
- obtain/clarify IGDB commercial partnership permission before monetized production use
- test cover coverage and image suitability
- do not assume IGDB region/localization metadata is strong enough for PALScout exact-copy decisions

Current verdict: **PRIMARY CANDIDATE — benchmark next.**

### MobyGames — high-quality but expensive for a pre-revenue product

Official API:
https://www.mobygames.com/info/api/
Subscription:
https://www.mobygames.com/api/subscribe/

Current pricing shown:
- Hobbyist: $9.99/month, non-commercial
- Bronze: $99.99/month, commercial use allowed
- Silver: $499.99/month and adds identifiers/product codes/AKAs

Strengths:
- deep historical database
- platform/game metadata
- covers and screenshots
- commercial plans permit local storage
- Silver's identifiers/product codes could be useful for collector intelligence

Problems for GrailRaven now:
- commercial Bronze is already $99.99/month
- useful identifiers/product codes require the much more expensive Silver tier
- project is pre-revenue and already evaluating a separate paid PriceCharting subscription

Current verdict: **GOOD SUPPLEMENTAL/VALIDATION SOURCE LATER; NOT PRIMARY NOW.**

### RAWG — possible fallback, but current public terms are less clean

Official API:
https://rawg.io/apidocs
API-specific terms:
https://rawg.io/tos_api

Public API documentation advertises a large catalogue and commercial-use options. The API-specific terms describe a free commercial allowance under traffic/request thresholds, but RAWG also has broader site terms that are more restrictive.

Why not first choice:
- public wording across pages is less internally clear than IGDB
- commercial Business plan is advertised at $149/month on the API page
- exact retro physical-release identity is not its core strength

Current verdict: **SECONDARY FALLBACK; DO NOT BUILD CORE DEPENDENCY YET.**

### ScreenScraper — unsuitable as the commercial base/art source

Public pages display Creative Commons Attribution-NonCommercial-ShareAlike 4.0 language for community data/media.

That non-commercial restriction is incompatible with the intended monetized GrailRaven product unless separate commercial permission is obtained.

Current verdict: **DO NOT USE AS PRIMARY COMMERCIAL SOURCE WITHOUT SEPARATE PERMISSION.**

### Giant Bomb — not suitable without commercial permission

Current terms restrict general content to personal/non-commercial use and require written permission for commercial use.

Current verdict: **DO NOT USE AS PRIMARY SOURCE.**

## Current recommendation

Use **IGDB as the first source to benchmark**, not yet as an unquestioned permanent dependency.

Next engineering experiment:
1. create an IGDB developer application
2. store Client ID/secret outside source control
3. build a read-only importer that fetches PS1 / PS2 / Dreamcast records into a temporary report
4. compare imported records against the pinned 100-game benchmark
5. measure:
   - benchmark-title coverage
   - title/alias quality
   - duplicate/edition behavior
   - release date coverage
   - developer/publisher coverage
   - cover coverage
6. inspect a sample of obscure PAL/Japanese/US titles
7. only after the report is satisfactory, import into the canonical base catalogue

Do not use IGDB metadata to upgrade a game's PALScout coverage automatically.

## Cost principle

Because GrailRaven is pre-revenue, prefer sources that let us validate the catalogue without creating another recurring bill.

This is why IGDB should be tested before commercial MobyGames or RAWG plans.


## Read-only benchmark harness

Implemented:
- `scripts/igdb-catalogue-benchmark.mjs`
- `.github/workflows/igdb-catalogue-benchmark.yml`

Secrets:
- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`

The workflow:
- obtains an application access token via Twitch client credentials
- resolves PS1, PS2 and Dreamcast platform records
- records IGDB's raw game counts for each platform
- searches every pinned 100-game benchmark title on the expected platform
- records exact-name/alias coverage, covers, release dates and company metadata
- uploads a JSON report
- performs no canonical catalogue import
- never writes credentials into the report


## First IGDB benchmark result — 6 October 2026

Workflow run completed successfully against the pinned 100-game benchmark.

Summary:
- exact canonical-name or returned-alias matches: 92/100
- candidate-review rows: 2/100
- no-match rows: 6/100
- rows with cover art: 94/100
- rows with release-date data: 94/100
- rows with company/developer/publisher data: 94/100

Exact/alias match rate by platform:
- PS1: 38/40
- PS2: 36/40
- Dreamcast: 18/20

IGDB raw platform record counts returned by the count endpoint:
- PlayStation: 3,941
- PlayStation 2: 4,297
- Dreamcast: 739

These raw counts are not equivalent to retail-library counts. They may include versions/categories/region records and must be filtered/deduplicated before becoming GrailRaven catalogue totals.

Examples exposing title-normalisation/alias issues:
- `Crash Bandicoot 3: Warped` -> IGDB returned `Crash Bandicoot: Warped`
- `MediEvil 2` -> IGDB returned `MediEvil II`
- `Obscure II` -> IGDB returned `ObsCure: The Aftermath`
- `Project Zero 3: The Tormented` did not resolve through the simple title search; regional naming is likely relevant
- `Shin Megami Tensei: Lucifer's Call` did not resolve through the simple title search
- `Project Justice: Rival Schools 2` did not resolve through the simple title search
- `Marvel vs. Capcom 2` returned `Marvel vs. Capcom 2: New Age of Heroes` as a review candidate
- `Forbidden Siren` incorrectly surfaced `Forbidden Siren 2` as a review candidate; this proves prefix/fuzzy matching cannot be trusted for automatic imports

Decision:
**IGDB remains a promising base-catalogue candidate, but do not bulk-import yet.**

Next benchmark/import work must build a platform-wide local alias index and conservative identity resolution. Only exact canonical/alias/provider mappings may auto-merge; fuzzy/prefix candidates must remain review items.


## Commercial-use publication gate

Current IGDB documentation contains two complementary statements:
- getting-started guidance says the API is free for non-commercial use and directs projects with commercial needs to the commercial partnership process
- the business FAQ says commercial integrations are allowed, the API price is free for both non-commercial and commercial projects, local caching/storage is allowed and preferred, and partnership integrations are expected to provide visible user-facing attribution to IGDB.com

Therefore:
- do not describe IGDB as requiring a paid API subscription
- do not assume a monetized GrailRaven launch is covered merely by having Twitch API credentials
- contact `partner@igdb.com` and complete/clarify the commercial partnership before publishing the IGDB-backed full catalogue as part of the commercial product
- keep attribution as a product requirement
