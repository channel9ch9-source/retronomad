# RetroNomad Project State

Last updated: 23 September 2026

This file is the durable handoff for the RetroNomad project.

A new working session should read, in order:
1. `PROJECT_STATE.md`
2. `DECISIONS.md`
3. `ROADMAP.md`
4. `PRICING_V1.md`

The repository is the authoritative project handoff. Chat memory is supplementary and should not be treated as the sole record of product decisions.

## Product

**RetroNomad** is a global retro-game buying/deal-finder assistant.

Tagline: **Find the right copy. Wherever it was released.**

**PALScout** is RetroNomad's first regional intelligence layer for UK/European physical releases.

Core principle: identify the exact physical release before comparing price. Never compare unlike releases, regions, editions, completeness states or item types.

## Evidence hierarchy

1. Exact verified catalogue/barcode/reference match when unique
2. Positive visual/gallery evidence across the listing
3. Explicit seller title/description
4. Marketplace item specifics
5. Generic product metadata

Conflicts lower confidence and force REVIEW. Absence from one photo is never proof that a component is missing. Possible reproductions should be held for review rather than accused from weak signs.

## Classification fields

- Game
- Platform
- Item type
- Region (PAL / NTSC-U / NTSC-J)
- Country/edition
- Release / budget line / promo
- Completeness
- Condition
- Authenticity / repro caution
- Bundle
- Item price
- Postage
- Total
- Confidence
- Review reason / missing evidence

## Market buckets

- UK_EXACT
- UK_SHARED_PAL
- UK_COMPATIBLE_EU_ENGLISH
- UK_VISUAL_REQUIRED
- NO_OFFICIAL_UK_RETAIL
- EUROPE_UNRESOLVED

Rules:
- Explicit foreign territory evidence (NTSC-J, NTSC-U/C, Japan, USA, PAL-FR/ITA/DE/ES, etc.) must not enter a UK comparison bucket unless stronger exact identifier evidence creates an explicit conflict for review.
- Bundles are separate.
- Demo/promo products are separate, but a retail game that merely includes a bonus demo disc is not itself a demo.
- Release-family collisions are blocked (for example MGS3 Snake Eater must not be mapped to Subsistence).
- Condition problems change the comparison bucket/status, not the underlying release identity.

## Reference data

Launch scope:
- PS1: 40 games
- PS2: 40 games
- Dreamcast: 20 games
- 100 games total

Market-aware v3 data:
- 217+ release-evidence records
- UK_EXACT: 51 games
- UK_SHARED_PAL: 12 games
- 63/100 identifier-comparison-ready without forced country guessing
- UK_COMPATIBLE_EU_ENGLISH: 28
- UK_VISUAL_REQUIRED: 7
- NO_OFFICIAL_UK_RETAIL: 1
- EUROPE_UNRESOLVED: 1

Important special cases:
- Silent Hill PS1 SLES-01514 / 4988602555660 is shared PAL; needs package evidence.
- FFVII UK SCES-00867 / 0711719694328 is UK exact.
- FFVII Spain SCES-00900 / 0711719694625 is non-UK exact.
- Vagrant Story 4036636200459 is UK exact; 4036636200480 is non-UK exact; SLES-02754 is shared.
- Dreamcast -50 codes are European, not UK-only.
- T-36806D-05 (RE Code Veronica DC), T-7019D-05 (Dino Crisis DC), T-17715D-05 (Grandia II DC) are strong UK evidence.
- Rule of Rose PS2 has no normal UK retail release; do not invent a UK retail bucket.
- Street Fighter Alpha 3 PS1 remains Europe unresolved in the seed.

## Validation

A real/current-or-recent 50-listing UK marketplace benchmark was created.

Initial benchmark:
- Decision/status: 39/50 = 78%
- Game ID: 45/50 = 90%
- Platform: 50/50 = 100%
- Edition: 47/50 = 94%
- Completeness parsing: 36/50 = 72%
- One critical false-ready case: Japanese NTSC-J Shenmue II fell into a shared-PAL READY path.

Fixes implemented after benchmark:
- foreign-region veto
- bundle detection
- bonus demo vs main demo distinction
- Klonoa short-name alias
- MGS3 Snake Eater vs Subsistence separation
- broader completeness phrases
- missing-disc/incomplete parsing
- seller-text condition parsing
- parent-title overlap pruning (e.g. Shenmue vs Shenmue II)
- magazine/demo item-type separation

Rerun result:
- title-only rerun reached 49/50 decisions; the remaining Tombi condition fact existed in seller details, not the title.
- full preserved listing-detail reasoning reached 50/50 status matches with zero false-READY cases.
Do not claim universal 100% classifier accuracy; this result applies to the fixed 50-listing benchmark.

## Public product

Repository:
channel9ch9-source/RetroNomad

GitHub Pages:
https://channel9ch9-source.github.io/retronomad/

Analyser:
https://channel9ch9-source.github.io/retronomad/analyze.html

Current analyser includes:
- listing title + description
- URL ingestion with eBay item-ID/title fallback
- platform auto-inference
- completeness auto-inference
- edition detection
- automatic serial/barcode extraction
- 100-game launch catalogue
- identifier-level PALScout evidence
- photo upload (up to 6)
- local browser OCR with Tesseract.js
- photo serial/barcode candidates
- gallery component confirmation: disc/manual/case/barcode/spine
- all-discs confirmation
- English/UK package confirmation
- visible-condition flags
- region signals and foreign-region veto
- bundle handling
- Comparison-ready / Review / Separate classification
- manual Pricing v1 references saved locally by exact comparison bucket
- automatic Pricing v1 connector described below
- internal 100-title Pricing v1 coverage lab at `pricing-coverage.html`

## Pricing v1 first live-provider run

First real-key coverage run: 23 September 2026.

Result:
- 100/100 titles attempted
- 0 safe matches
- 100 initially reported as NO_PAL_MATCH

Interpretation:
- **Do not treat this as evidence that RetroTechCollector lacks all 100 PAL titles.**
- The all-or-nothing result is a systematic diagnostic signal.
- The original coverage lab collapsed several distinct cases into one NO_PAL_MATCH status after applying exact platform + PAL filters.
- Diagnostic v2 now records raw catalogue candidates before filtering and distinguishes:
  - NO_RESULTS
  - PLATFORM_MISMATCH
  - REGION_MISMATCH
  - weak/ambiguous/title conflicts
- Diagnostic v2 also removes the exact platform parameter from title discovery so provider platform labels can be observed rather than hidden by the request itself.

Next action: rerun the updated coverage lab with the same limited developer key and inspect the exported diagnostic JSON before changing production platform/region mappings.

## Pricing v1 diagnostic v2 result

Second real-key run: 23 September 2026.

Result:
- 100/100 titles attempted
- 91 NO_RESULTS
- 5 PLATFORM_MISMATCH
- 4 REGION_MISMATCH
- 0 safe matches under the old catalogue-first/PAL-required logic

What this established:
- RetroTechCollector's observed PS1 platform label is `Sony PlayStation`, not the originally assumed `PlayStation`.
- Valid Dreamcast catalogue rows can have `region: null`; null must not be silently treated as PAL.
- 71 of 72 UPC/EAN **catalogue** lookups returned no row. The one UPC catalogue hit was Rez.
- 28 titles used title search; only a minority returned candidate catalogue rows.
- The provider documentation states that `/prices` also supports UPC and title filters and returns pricing rows with a UPC field. Therefore catalogue coverage alone is not enough to judge pricing-provider fit.

Diagnostic v3 now:
- tests `/prices?upc=` first when RetroNomad has a safe barcode
- falls back to `/prices?search=`
- recognises observed platform aliases (including `Sony PlayStation`)
- fetches catalogue detail by `masterItemId` to inspect region separately
- distinguishes exact UPC price matches, PAL title-price matches, region-unknown title matches, catalogue-only rows and no provider match
- never treats a title-only match with unknown/non-PAL region as safe PAL pricing

Next action: run diagnostic v3 over the 100 launch titles and use that report to decide whether RetroTechCollector is viable enough to keep.

## PALScout compatibility verdict

Added to the public analyser on 23 September 2026.

PALScout now gives a dedicated hardware-compatibility result separately from the existing UK-market/release classification.

Launch behaviour:
- target is a standard, unmodified UK/European console for the detected launch platform (PS1, PS2 or Dreamcast)
- recognised PAL-family identifier evidence can produce a PAL-compatible verdict
- explicit NTSC-U / NTSC-J evidence produces a not-PAL-compatible verdict unless stronger PAL identifier evidence creates a conflict/review state
- generic PAL wording without stronger identifier evidence remains provisional
- a French/German/Spanish/Italian PAL copy can be hardware-compatible even though it is not a UK-market copy
- packaging/language, UK collector-market identity and hardware compatibility are intentionally separate questions
- modified consoles, import adapters and similar workarounds are outside the launch compatibility verdict

This makes the first user-facing PALScout question explicit: “Will this copy run on ordinary UK/European PAL hardware?”

## Pricing v1 diagnostic v3 result and provider decision

Third real-key run: 23 September 2026.

Result:
- 100/100 titles attempted
- 33 TITLE_PRICE_REGION_UNKNOWN
- 62 NO_PROVIDER_MATCH
- 4 WEAK_MATCH
- 1 UPC_PRICE_MATCH
- 1/100 safe matches
- 0 title-price matches explicitly confirmed PAL

Key interpretation:
- RetroTechCollector is not viable as RetroNomad's primary UK/PAL pricing provider for the current 100-title launch scope.
- The one release-safe exact identifier hit was Rez (Dreamcast), UPC/EAN 5060004761289.
- Region-unknown title matches cannot be used as PAL pricing. In many cases the provider returned a different UPC from RetroNomad's PAL/EAN seed, showing that title fallback can cross into another regional release.
- PS2 coverage was particularly poor in this launch test: no safe exact UPC/PAL title-price matches.
- Provider documentation states RetroTechCollector's market values come from PriceCharting.

Safety patch now live:
- provider platform aliases updated (including `Sony PlayStation`)
- exact-barcode pricing uses the price endpoint directly
- exact barcode/equivalent barcode + title/platform agreement is required
- if an exact PAL/UK barcode lookup misses, title fallback is blocked
- title-only pricing is allowed only when the matched provider catalogue row explicitly says PAL
- the serverless worker template enforces the same rules

Provider direction:
- RetroTechCollector remains only a limited possible exact-identifier supplemental source.
- PriceCharting direct is the strongest next candidate because its public catalogue contains dedicated PAL products with PAL EAN/GTIN/model metadata.
- PriceCharting's standard API/CSV terms are internal-use only; public third-party display requires a commercial licence and express written permission.
- Do not integrate or expose a normal PriceCharting token without permission.
- Manual Pricing v1 remains the safe fallback while licensed provider access is unresolved.

## Pricing v1

Goal: only attach price data after the listing has been classified into the correct release/completeness bucket.

Never manufacture an 'average eBay market price'.

### Automatic beta provider: RetroTechCollector

Chosen for the first automatic-pricing pilot because its Developer Data API:
- exposes catalogue metadata including platform, UPC and release region
- exposes latest price snapshots for loose, CIB, new, box-only and manual-only
- supports browser CORS
- offers a Developer API add-on (currently documented at £9/month)
- stores price snapshots in USD
- supports catalogue and pricing scopes

Beta security model:
- BYOK (bring your own developer key)
- key is entered by the user
- key is stored only in browser sessionStorage for the current tab/session
- key is never committed to GitHub and is not stored in RetroNomad local pricing records
- required scopes: catalogue:read and prices:read

Automatic matching:
1. Pricing only auto-runs after Comparison-ready classification.
2. Prefer UPC/EAN when a numeric identifier is available.
3. Otherwise search by exact game title + mapped platform.
4. Require PAL catalogue rows for the current UK/PAL launch mode.
5. Reject weak or ambiguous catalogue matches.
6. Barcode/UPC lookup is not trusted blindly: a provider row that conflicts with the classified game, or multiple similarly strong PAL rows, is rejected for manual review.
7. Fetch price by matched masterItemId.
8. Map CIB→cib, Loose→loose, New→new, Box Only→boxOnly, Manual Only→manualOnly.
9. Do not auto-price Incomplete or Condition-specific copies.
10. Convert USD→GBP with a daily central-bank reference rate via Frankfurter.
11. Populate the existing Pricing v1 form and comparison panel; do not label a purchase 'good' or 'bad'.

Production shared-key mode:
- do not put a service API key in GitHub Pages.
- a production shared key needs a backend/serverless secret store.
- confirm with the provider that public third-party display/redistribution is permitted under the intended plan before using one shared RetroNomad key.

PriceCharting remains a possible future provider, but its API documentation states that application display to third parties requires a commercial licence and express written permission. Do not expose a normal subscriber token in the public app.

## Pricing v1 manual fallback

Manual/user-provided references remain available:
- market/price-guide reference
- personal target price
- manual comparable
- low / typical / high
- source name
- source URL
- reference date
- item-only vs landed basis
- exact comparison bucket

Saved locally per exact key:
Game · Platform · Release · Edition · Completeness/condition bucket

Pricing is gated if classification is not Comparison-ready.

## Architecture constraints

Current hosting is static GitHub Pages.
It cannot safely hold shared API secrets or run Python/Flask server-side.

Current browser-side integrations:
- listing page metadata fetch where CORS allows
- Tesseract.js local OCR
- BYOK pricing API
- free/reference FX API

Future production dynamic features (shared marketplace/pricing credentials, accounts, alerts, scheduled discovery) require a backend/serverless host.

## eBay developer account

The earlier eBay developer application was rejected after appeal under internal eligibility/risk controls. Do not evade or spam reapplications.

When reapplying later:
- use accurate real information
- use a project/business email where appropriate
- point to the working public RetroNomad prototype
- clearly explain authorised Browse API use
- do not conceal the earlier rejection

Potential eventual architecture:
- eBay Browse API: active listing discovery
- RetroNomad classifier/reference DB: release identification
- licensed pricing source: valuation
- user target prices/alerts
- no unauthorised eBay sold-data-derived market averages

## Brand

Parent: RetroNomad
Regional layer: PALScout
Tagline: Find the right copy. Wherever it was released.

PALScout is not the parent brand because the product is intended to expand globally.

## Roadmap from this point

1. Pricing-provider validation for RetroTechCollector is complete; retain it only for exact-identifier supplemental matches.
2. Contact PriceCharting about a commercial/public-app licence for attributed PAL guide-price display.
3. In parallel, continue researching region-aware physical-game pricing sources with documented API/licensing terms.
4. Keep manual Pricing v1 as the default fallback until a licensed release-safe provider is available.
5. Once a provider is approved, run the same 100-title launch coverage benchmark before production integration.
6. Then validate full listing → classification → exact release → price → GBP conversion flow.
7. Add wishlist + target-price alerts after backend/serverless infrastructure exists.
8. Revisit authorised marketplace discovery, including eBay only if legitimate developer access becomes available.
9. Expand to NTSC-U, NTSC-J and more platforms only after UK/PAL pricing is stable.

## Durable project records

- `PROJECT_STATE.md`: current product state, implementation status and key evidence
- `DECISIONS.md`: durable product/architecture decisions and rationale, including the eBay developer-access history
- `ROADMAP.md`: completed milestones, active milestone, blockers and exit criteria
- `PRICING_V1.md`: detailed Pricing v1 provider and security rules

When a substantial session changes the project, update the relevant durable record before ending the session.

## Accuracy/transparency requirements

- Never fabricate favourable deal results.
- Never fake benchmark improvements.
- Never call something a Good Deal without a trustworthy price reference.
- 'Comparison-ready' means classification is ready; it does not mean the price is good.
- Unknown/ambiguous evidence must become Needs review.
- If a provider has no price or the mapping is ambiguous, show that honestly.


## Homepage product-positioning refresh

Completed 23 September 2026.

The public homepage now leads with the concrete buyer problem rather than abstract release classification.

Primary customer journey:
1. Check whether the physical copy appears compatible with standard UK/European hardware.
2. Identify the exact regional/physical release.
3. Check completeness and condition evidence.
4. Compare value only when a trusted release-safe pricing source is available.

Brand structure:
- RetroNomad remains the global parent product.
- PALScout is presented prominently as the UK/European compatibility + release-intelligence layer.
- US/NTSC-U and Japan/NTSC-J are shown as planned future regional intelligence layers.

Accuracy/marketing changes:
- removed the previous illustrative marketplace-results count that could imply automatic listing discovery is already live
- homepage now states that users submit listing URLs/text/photos today
- marketplace discovery is clearly marked planned
- exact-release valuation is clearly marked in development
- PAL compatibility is explicitly separated from UK-market identity and packaging/language
- compatibility scope is explicitly standard, unmodified UK/European hardware



## PALScout compatibility QA and URL-ingestion repair

Completed 23 September 2026.

Compatibility QA:
- representative UK exact PAL, continental PAL, NTSC-U, NTSC-J, unknown and conflicting-region cases were exercised
- mixed PAL + NTSC evidence now becomes review rather than an outright compatibility verdict
- common negated seller wording such as "UK PAL - not NTSC-US" no longer falsely triggers the NTSC path
- PlayStation serial prefixes are now used as hardware-region evidence:
  - SLES/SCES -> PAL Europe signal
  - SLUS/SCUS -> North America/non-PAL signal
  - SLPS/SLPM/SCPS/SCPM -> Japan/Asia-family non-PAL signal
- PAL-Europe serial evidence does not by itself claim a UK-specific release
- region detection now considers listing text, OCR-derived text and an explicitly supplied identifier
- the compatibility regression cases passed after the fixes

URL-ingestion repair:
- the current analyser still referenced `cleanUrlInput`, `detectListingSource`, `parseEbayUrl` and `importListingUrl`, but their definitions had disappeared during later analyser changes
- the helper block was restored from the earlier repository commit that introduced marketplace URL ingestion rather than reconstructed from memory
- syntax validation passes
- representative eBay URL parsing recovers item IDs and title slugs
- generic source detection still recognises eBay, Etsy and Vinted
- direct browser page import remains subject to marketplace CORS/access restrictions; eBay's full automatic listing import still requires authorised API/server-side access



## Search-first product direction

Confirmed 23 September 2026.

RetroNomad is now defined primarily as a **search and buying-intelligence product**.

The customer should come to RetroNomad to search for the game they want. RetroNomad should eventually discover authorised marketplace listings, then use PALScout/regional intelligence to classify and filter them before showing the user the best-matching copies.

Primary workflow:
Search -> Filter -> Compare -> Alert

PALScout's role:
Compatibility -> Region -> Exact release -> Edition -> Completeness

The listing analyser remains a useful secondary checker/debugging utility, but future development should not treat manual URL/text/photo submission as the main consumer experience.



## Reaffirmed original product concept

User restated the original concept from the prior chat on 23 September 2026.

RetroNomad is a **Retro Game Hunting Assistant** with one app containing:
1. Deal Finder
2. Wishlist + price alerts
3. "Should I buy this?" listing analysis
4. Photo / Lot Analyzer later

Build order:
- Phase 1: Deal Finder + Wishlist alerts
- Phase 2: "Should I buy this?" analysis
- Phase 3: Photo / Lot Analyzer
- Phase 4: More marketplaces + advanced collector features

This is consistent with the newly confirmed search-first direction. The current listing analyser should be treated as enabling technology and a future secondary utility, not the main consumer product.

PALScout remains the UK/European release-intelligence layer underneath Deal Finder, alerts and listing analysis.



## Phase 1 search shell

Completed 23 September 2026.

New public page:
`search.html`

The search-first shell now lets a user define:
- game
- platform
- PAL/UK release preference
- edition
- completeness
- condition preference
- English-friendly packaging/materials requirement
- bundle exclusion
- demo/promo exclusion
- maximum delivered GBP price

The page uses the existing release-evidence catalogue and currently resolves 100 unique launch game/platform pairs.

Current behaviour:
- builds a structured buying target
- shows the future live result-card contract
- can save targets locally in the browser as a prototype convenience
- explicitly states that alerts are not active
- explicitly states that no live marketplace source is connected
- does not fabricate listings or prices

Marketplace abstraction:
- `marketplace-source.js` provides a provider registry and normalisation layer
- `marketplace-listing.schema.json` defines the normalised listing contract
- `MARKETPLACE_V1.md` documents launch filters, target model, result-card fields and accuracy rules

The homepage now points primarily to Search RetroNomad and presents Search -> Filter -> Compare -> Alert as the main customer journey. The listing analyser remains linked as a secondary utility.



## Phase 1 matching engine

Completed 23 September 2026.

New module:
`search-matcher.js`

Purpose:
Evaluate a PALScout-classified marketplace candidate against the user's structured search target.

States:
- MATCH
- REVIEW
- FILTERED

The engine keeps hard requirements, unknown evidence and soft preferences separate.

Representative regression cases passed for:
- exact UK PAL match
- shared PAL match
- NTSC-U incompatibility
- wrong edition
- incomplete copy
- price ceiling failure
- unknown completeness
- continental PAL with unknown English/package suitability

UK-market preferred is deliberately treated as a ranking preference, not the same as UK exact only.

The search page now loads the matcher module. A live marketplace result still requires two upstream pieces:
1. an authorised marketplace inventory provider
2. reusable PALScout classification of each candidate listing

No live inventory is fabricated while those sources are unavailable.


## Reusable PALScout marketplace classifier

Completed 23 September 2026.

New modules:
- `palscout-classifier.js`
- `search-pipeline.js`

The Deal Finder pipeline is now structurally:

Authorised marketplace adapter
-> normalised marketplace listing
-> PALScout classification
-> RetroNomad target matcher
-> ranked MATCH / REVIEW / FILTERED results

`palscout-classifier.js` reuses the current 100-game launch catalogue and analyser aliases and returns:
- game
- platform
- item type
- compatibility state
- region signal
- release market bucket
- catalogue market context
- edition
- completeness
- English/package suitability when explicit
- bundle / promo state
- major condition concerns
- identifier evidence
- confidence
- review reasons / conflicts

Safety rules added for search use:
- title alone never proves a UK-exact release
- generic PAL wording without stronger evidence remains review
- identifier/title or identifier/platform conflicts force review
- UK_VISUAL_REQUIRED cannot become a strong search match without the missing visual/package evidence
- explicit wrong-region / wrong-edition / wrong-completeness candidates remain filterable by the matcher

Marketplace normalisation now preserves item specifics, condition text, identifiers, explicit language suitability and OCR text where a future authorised provider exposes them.

Synthetic end-to-end QA:
- 6 candidate FFVII listings were passed through a synthetic provider adapter
- outcome: 1 MATCH, 1 REVIEW, 4 FILTERED
- exact UK CIB under ceiling -> MATCH
- generic PAL without exact release evidence -> REVIEW
- NTSC-U -> FILTERED
- Platinum with original-only target -> FILTERED
- bundle with bundles excluded -> FILTERED
- price above delivered ceiling -> FILTERED

No synthetic provider is registered in the public site. It was used only for implementation QA; the public search still correctly reports that no live source is connected.


## Saved Hunts / wishlist foundation

Completed 23 September 2026.

New files:
- `saved-hunts.js`
- `saved-hunt.schema.json`
- `wishlist.html`
- `SAVED_HUNTS_V1.md`

Saved Hunts now replace the earlier bare localStorage target prototype.

Capabilities:
- create a versioned Saved Hunt from a Deal Finder search target
- prevent duplicate active targets
- automatically migrate old `retronomad_saved_targets` data
- list hunts in a dedicated wishlist page
- pause / resume / archive / delete
- record whether the user wants future alerts
- reopen a hunt into `search.html?hunt=<id>`
- export Saved Hunts as JSON
- store foreground last-checked summaries when a live provider eventually runs
- store/deduplicate matching-listing history by source + external ID

Regression tests passed for save, duplicate prevention, pause state, alert preference, foreground check metadata, match-history deduplication and legacy migration.

Important limitation:
- Saved Hunts are browser-local.
- monitoring state begins as NOT_RUNNING.
- alert state is UNAVAILABLE_STATIC_BETA.
- no scheduled background checks or real notifications exist yet.
- autonomous alerts require both backend infrastructure and an authorised live marketplace source.



## Alert backend foundation

Completed 23 September 2026.

New files:
- `backend/schema.sql`
- `backend/monitor-core.js`
- `backend/alerts-worker.js`
- `ALERTS_BACKEND_V1.md`

The backend architecture is provider-neutral:

Saved Hunt -> scheduler -> authorised marketplace adapter -> PALScout -> target matcher -> new MATCH detection -> notification queue -> future notification delivery.

Persistence now covers server-side saved hunts, qualifying matches, monitor-run audit records and the notification queue.

Monitor rules:
- only ACTIVE hunts run
- only MATCH results can become qualifying matches
- REVIEW and FILTERED never trigger alerts
- listings are deduplicated by source + external ID
- only newly qualifying listings can create a notification event
- a repeated sighting of the same listing does not create a duplicate alert
- hunts without alert preference do not queue notifications
- PAUSED hunts are skipped

Regression QA passed for first-match notification, repeat-run deduplication, REVIEW/FILTERED exclusion, alert preference and paused-hunt skipping.

The Worker shell currently exposes readiness information and an admin-only future run hook. Public hunt sync remains intentionally disabled until real account authentication and ownership exist.

This code is infrastructure only and is not deployed. Real monitoring still requires authenticated hunt ownership, server-side PALScout/matcher execution, an authorised live inventory source and a notification provider.


## Passwordless accounts + Saved Hunt sync

Implemented 23 September 2026.

New files:
- `backend/auth-core.js`
- `runtime-config.js`
- `account-sync.js`
- `account.html`
- `ACCOUNTS_SYNC_V1.md`

Updated:
- `backend/schema.sql`
- `backend/alerts-worker.js`
- `saved-hunts.js`
- `search.html`
- `wishlist.html`
- `index.html`

Authentication design:
- passwordless email one-time link
- raw login token is never persisted; backend stores SHA-256 hash
- raw session token is never exposed to app JavaScript; backend stores SHA-256 hash
- intended production session is Secure + HttpOnly + SameSite=Lax
- 15-minute one-time login link
- 30-day revocable session
- account ownership derives only from authenticated session

Saved Hunt sync:
- local hunts upload to authenticated owner
- complete server snapshot returns to browser
- deletes create local tombstones
- server soft-deletion prevents stale devices resurrecting deleted hunt IDs
- ID collisions owned by another user are rejected
- browser clears only server-acknowledged tombstones
- search save can sync immediately when authenticated
- wishlist provides manual Sync now

QA:
- all updated browser/backend files pass syntax validation
- local deletion produces a tombstone
- acknowledged tombstone clears
- server snapshot replacement works
- account client does not issue requests while runtime account sync is disabled

Current public status:
Account code exists but the service is not deployed. `runtime-config.js` intentionally sets accountSyncEnabled=false. Public Saved Hunts therefore remain browser-local.

Deployment still needs:
- database binding
- app/API same-site or custom-domain setup
- email delivery adapter
- rate limiting / abuse controls
- privacy-policy/account-data update



## Shared browser/server classification core

Completed 23 September 2026.

New files:
- `shared/palscout-core.js`
- `shared/search-matcher-core.js`
- `shared/release-evidence-data.js`
- `backend/search-engine.js`
- `SHARED_CLASSIFIER_V1.md`

Updated:
- `palscout-classifier.js` is now a browser adapter to the shared PALScout core
- `search-matcher.js` is now a browser adapter to the shared matcher core
- `search-pipeline.js` waits for those shared modules before evaluating results
- `backend/alerts-worker.js` routes authorised provider candidates through `backend/search-engine.js`

Backend scheduled-search path is now:
authorised marketplace candidates -> shared PALScout -> shared matcher -> ranked MATCH/REVIEW/FILTERED -> alert monitor.

Parity QA:
- shared release-evidence mirror contains 217 rows
- serialized shared evidence exactly matched browser release-evidence.js
- representative six-candidate regression produced 1 MATCH, 1 REVIEW and 4 FILTERED as expected
- exact UK CIB under target -> MATCH
- generic PAL with insufficient release proof -> REVIEW
- NTSC-U, wrong edition, bundle and over-price candidates -> FILTERED

Important scope:
The Deal Finder and scheduled backend now share one classification/matching implementation. The richer Phase 2 `analyze.html` listing checker still contains embedded photo/UI-specific logic and has not yet been fully migrated to the shared core.


## Cloudflare scaffold deployment package

Prepared 23 September 2026.

New deployment files:
- `package.json`
- `scripts/build-cloudflare.mjs`
- `scripts/prepare-cloudflare.mjs`
- `backend/migrations/0001_initial.sql`
- `.github/workflows/deploy-cloudflare.yml`
- `.gitignore`
- `CLOUDFLARE_DEPLOYMENT.md`

Deployment design:
- one Cloudflare Worker serves both static RetroNomad assets and API routes
- same-origin deployment preserves Secure + HttpOnly cookie session architecture
- D1 is bound as `env.DB`
- first migration creates users, auth tokens, sessions, Saved Hunts, match history, monitor runs and notification queue
- hourly cron trigger is configured
- marketplace and notification providers remain disabled
- GitHub Pages remains local-only
- Cloudflare build generates runtime config with account sync enabled and same-origin API

Automation:
- manual GitHub Actions workflow
- installs Wrangler
- builds `dist/public`
- lists D1 databases
- creates `retronomad-prod` in the Western Europe location if missing
- generates deployment Wrangler config with the discovered database ID
- applies D1 migrations
- optionally configures the auth-email webhook secret
- deploys Worker + static assets

Current deployment status:
DEPLOYED SUCCESSFULLY on 24 September 2026.

Live scaffold:
`https://retronomad-app.channel9ch9.workers.dev`

Deployment verification from GitHub Actions:
- Cloudflare authentication succeeded
- D1 database `retronomad-prod` was created
- migration `0001_initial.sql` applied successfully
- 24 static assets uploaded
- Worker `retronomad-app` deployed successfully
- workers.dev route created
- hourly scheduled trigger deployed
- deployed Worker version ID: `8f175db9-1933-4805-a53b-5da41250160b`

The first deploy attempt failed only because the Cloudflare account had not yet registered its workers.dev subdomain. After `channel9ch9.workers.dev` became available, the failed deployment job was rerun and completed successfully.

Current live limitation:
- account/backend/D1 scaffold is deployed
- passwordless email delivery is not configured yet
- marketplace provider remains disabled
- notification provider remains disabled

Smoke test completed 24 September 2026:
- live main app loads on desktop
- Search, Saved Hunts and Account pages load on desktop
- `/health` reports databaseConfigured=true
- `/health` reports appOriginMode="self"
- `/health` reports serverClassificationReady=true
- expected disabled services remain false: authEmailConfigured, marketplaceConfigured, notificationsConfigured

Mobile QA found that top navigation links were intentionally hidden by existing responsive CSS. A mobile-navigation fix was committed across index/search/wishlist/account/analyze so the links remain visible in a horizontally scrollable mobile row. This fix still requires a fresh Cloudflare deployment before it is live on workers.dev.

Mobile navigation was deployed and confirmed working on phone on 24 September 2026.

Passwordless email implementation update:
- Resend selected as the first transactional-email provider
- Worker now sends magic links directly through the Resend REST API when `RESEND_API_KEY` exists
- API key remains a Cloudflare Worker secret
- default development sender is `RetroNomad <onboarding@resend.dev>`
- optional `AUTH_EMAIL_FROM` supports a future verified RetroNomad domain
- legacy generic email webhook remains as fallback
- /health now reports both authEmailConfigured and authEmailProvider
- basic abuse guard added: one request/email/minute and five requests/email/15 minutes
- GitHub Actions now copies `RESEND_API_KEY` into the Worker secret store

Live auth-email milestone completed 24 September 2026:
- `RESEND_API_KEY` added to GitHub Actions secrets
- Resend-enabled Worker redeployed successfully
- live `/health` confirms `authEmailConfigured=true`
- live `/health` confirms `authEmailProvider="resend"`
- D1 remains configured
- server classification remains ready
- marketplace and notification providers remain intentionally disabled

Live passwordless sign-in smoke test passed 24 September 2026:
- user requested a sign-in link from the live Cloudflare account page
- Resend delivered the email successfully
- one-time magic link was accepted
- secure authenticated session was established successfully

Next live test:
save and sync a Hunt while signed in, then verify that the same Hunt appears after signing in from another browser/device.


Saved Hunt UX fix — 24 September 2026:
- live sync smoke test exposed that `Save to Saved Hunts` stayed disabled until `Search RetroNomad` had been pressed once
- search page now enables Save as soon as a valid game target exists
- Save now builds the target directly even if Search has not been run first
- requires Cloudflare redeploy before live verification


Cross-device sync/email UX findings — 24 September 2026:
- live phone sign-in succeeded
- user saw an old local Saved Hunt label (`SH1`) after sign-in; code review confirmed signing in did not automatically run Saved Hunt sync, so the phone could still show pre-existing local browser data before the cloud snapshot was merged
- wishlist now automatically runs Saved Hunt sync after authenticated account detection
- existing manual `Sync now` remains available
- wishlist beta copy updated to reflect that account sync is live while marketplace monitoring/notification delivery is still unavailable
- repeated Resend sign-in emails were being collapsed behind Gmail-style `Show quoted text`; email subject/body now include a per-request marker and the HTML has a clearer CTA so repeated sign-in messages are less likely to be collapsed as duplicate/threaded content
- these changes require a fresh Cloudflare deployment before live verification


Cross-device account/sync smoke test passed — 24 September 2026:
- user signed in successfully on phone via Resend magic link
- repeated sign-in email body now renders visibly instead of being collapsed behind quoted text
- Saved Hunts sync on phone showed the Silent Hill hunt created on PC, confirming PC -> D1 -> phone propagation
- an older phone-local hunt labelled `SH1` also appeared; this is consistent with the local-first merge/upload model and will be used to test deletion/tombstone propagation next

Next live test:
- delete `SH1` on phone
- sync phone
- sync PC
- confirm only the intended Silent Hill hunt remains on both devices
- this will validate cross-device deletion/tombstone behaviour end-to-end


Cross-device deletion/tombstone smoke test passed — 24 September 2026:
- user deleted the old `SH1` hunt on phone
- phone sync completed
- PC sync then removed `SH1` there as well
- only the intended Silent Hill hunt remained
- this confirms local deletion -> tombstone -> server soft-delete -> second-device removal works end-to-end

Account milestone status:
- passwordless email sign-in works live
- secure session flow works live
- Saved Hunts sync works PC <-> D1 <-> phone
- cross-device deletion propagation works live
- repeated sign-in email rendering issue is fixed


PriceCharting business-development update — 23/24 September 2026:
- JJ Hendricks replied to the RetroNomad commercial-data enquiry on 23 September 2026
- JJ described RetroNomad as a cool idea and introduced Brady, who handles business development arrangements
- no commercial permission or pricing terms have been granted yet
- current PriceCharting documentation confirms public/third-party display of price data requires a commercial license and express written permission
- PriceCharting also documents a Marketplace API with available-offer queries by product/console/condition; whether RetroNomad may surface those offers in a third-party buyer app must be explicitly confirmed with Brady
- next PriceCharting step is to wait for Brady's response and then clarify both pricing-display rights and live Marketplace-offer usage


## GrailRaven UI V2 design preview — 6 October 2026

A separate design preview now exists:
- `design-preview.html`
- `ui-v2.css`
- detailed durable specification: `UI_V2_DESIGN.md`

The preview is intentionally isolated from the live Deal Finder and uses clearly labelled example UI data only.

User selected the Collector Intelligence direction and requested these revisions after reviewing the first live preview:
- near-black/charcoal base instead of murky dark blue
- MATCH/active green `#00FF41`
- REVIEW orange `#FF5F1F`
- FILTERED red `#880808`
- green active checkboxes/toggles/navigation instead of blue
- more characterful gothic/old-world display typography, while retaining readable sans-serif UI text
- the more elegant raven logo direction from the second visual mockup
- a deliberately simplified phone layout with collapsible filters, shorter hero, fewer evidence thumbnails and more compact result cards

These decisions are now implemented as the second preview pass and recorded in `UI_V2_DESIGN.md`.

Do not migrate this visual system onto the production Search page until the preview has been reviewed again on desktop and mobile.


## UI V2 cleanup and pause — 6 October 2026

User requested one final visual cleanup before returning to product/database development.

Current preview decisions:
- plain black page/panel base
- MATCH green remains `#00FF41`
- REVIEW orange is now `#FF5C00`
- FILTERED red is now `#FF0023`
- generic green search/check/navigation highlighting removed; neutral white/grey used for those controls for now
- search hero is explicitly designed to use the selected game's cover/artwork once a legitimate catalogue artwork source exists
- preview uses a non-live placeholder art layer rather than scraping/hotlinking cover art
- raven mark now comes from the preferred second mockup; prior SVG approximation is rejected
- mobile top navigation now uses a Menu dropdown instead of horizontal scrolling
- typography is not approved/final and is intentionally deferred

Visual design is now considered good enough to park temporarily. The next major product task should be full PS1 / PS2 / Dreamcast base-catalogue architecture and population, while retaining the existing 100-game exact-release set as the deep validation benchmark.


### Final UI highlight cleanup — 6 October 2026

The remaining green UI interaction highlights were removed:
- desktop active Search/navigation highlight -> white
- mobile Filters button -> white

Green `#00FF41` is now intended mainly as a semantic MATCH/positive-status colour, while generic interaction emphasis is neutral white for the current design pass.


## Full catalogue architecture foundation — 6 October 2026

GrailRaven now separates broad game identity from deep physical-release intelligence.

New catalogue foundation:
- `catalogue/base-catalogue.json` — canonical base catalogue
- `catalogue/catalogue.schema.json` — v1 schema
- `shared/catalogue-core.js` — validation, normalization, ID and search-index helpers
- `scripts/build-catalogue.mjs` — compact browser-index builder
- `catalogue-index.js` — generated lightweight browser search index
- `tests/catalogue-core.test.mjs` — catalogue regression tests
- `CATALOGUE_V1.md` — authoritative architecture documentation
- `backend/migrations/0002_catalogue.sql` — D1 catalogue tables

Initial seed:
- 100 games total
- PS1: 40
- PS2: 40
- Dreamcast: 20
- all current seed entries are `PALSCOUT_DEEP` because they are backed by the existing 217 release-evidence rows

The 100-game set remains the permanent deep regression/benchmark population even after the base catalogue expands to thousands of titles.

Search is now decoupled from the release-evidence list:
- the Cloudflare build validates `catalogue/base-catalogue.json`
- it emits a compact `catalogue-index.js`
- `search.html` consumes the compact base index first
- legacy release-evidence derivation remains only as a fallback

Release-intelligence coverage states:
- `BASE_ONLY`
- `PALSCOUT_PARTIAL`
- `PALSCOUT_DEEP`

Critical product rule:
A `BASE_ONLY` game is allowed to be searchable, browsable and saved as a Hunt. Its presence in the base catalogue does not prove UK/PAL territory, edition, completeness or exact release. Missing physical-release evidence must stay unknown/REVIEW rather than being guessed.

The D1 catalogue layer is a future production/query mirror; external full-catalogue data should first pass through auditable provider-specific imports with provenance and collision review.

Next task:
Evaluate legitimate metadata and cover-art sources for complete PS1 / PS2 / Dreamcast coverage, then select the primary source(s) before building an importer.


### Logo colour preference confirmed — 6 October 2026

User likes the subtle warm ivory / bronze-gold tint of the current raven mark.

Current direction:
- raven remains warm ivory / muted bronze-gold
- GrailRaven wordmark remains warm ivory (`#F5F1E8`)
- UI remains primarily black/white with semantic MATCH/REVIEW/FILTERED colours
- exact production logo colour matching is deferred until final vector/logo cleanup


## IGDB catalogue benchmark setup — 6 October 2026

A Twitch Developer application named GrailRaven IGDB has been created by the user.

Current IGDB documentation was rechecked. It states free non-commercial API use; commercial needs should go through IGDB's partnership process. The earlier source-evaluation wording implying automatically free commercial use was corrected.

A read-only benchmark harness now exists:
- `scripts/igdb-catalogue-benchmark.mjs`
- `.github/workflows/igdb-catalogue-benchmark.yml`

It will benchmark the pinned 100-game population and PS1/PS2/Dreamcast platform counts before any canonical catalogue import.

Credentials must be stored only as GitHub secrets / future server-side secrets:
- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`

Do not commit the Client Secret or paste it into chat.


## IGDB catalogue benchmark result — 6 October 2026

The first read-only IGDB benchmark completed successfully. Durable metrics and the decision to require a safer alias/inventory pass before bulk import are recorded in `IGDB_BENCHMARK_2026-10-06.md`.


## IGDB platform-wide inventory benchmark ready — 6 October 2026

Added a second, stricter read-only IGDB benchmark:
- `scripts/igdb-platform-inventory.mjs`
- `.github/workflows/igdb-platform-inventory.yml`
- documentation: `IGDB_PLATFORM_INVENTORY.md`

This benchmark downloads the full IGDB record population for PS1, PS2 and Dreamcast into a temporary report and re-resolves the pinned 100 games using exact canonical names and exact aliases only.

Fuzzy/token and Roman-numeral comparisons are review hints only and can never auto-match.

The canonical catalogue and D1 remain untouched.


## IGDB deduplication/filter benchmark ready — 6 October 2026

The full platform inventory confirmed that IGDB coverage is broad but contains editions/versions and exact-name collisions.

A third read-only benchmark now measures provider filtering using IGDB's own `version_parent` and `game_type` metadata:
- `scripts/igdb-dedup-filter-benchmark.mjs`
- `.github/workflows/igdb-dedup-filter-benchmark.yml`
- `IGDB_DEDUP_FILTER_BENCHMARK.md`

No canonical catalogue import occurs in this benchmark.


### IGDB dedup first-run filter bug — 6 October 2026

The first dedup/filter workflow run completed successfully but exposed a benchmark classifier bug: returned IGDB game-type display labels were not normalized before comparison, so some Mods/Bundles/etc. were incorrectly retained as include candidates.

No catalogue data was modified.

The benchmark classifier has been corrected. A fresh dedup/filter run is required before proceeding to a dry full-catalogue import.


## Corrected IGDB dedup/filter result — 6 October 2026

Corrected benchmark completed successfully.

Provider populations after corrected filtering:
- PS1: 3,737 include candidates; 121 review; 83 excluded
- PS2: 4,040 include candidates; 145 review; 112 excluded
- Dreamcast: 709 include candidates; 17 review; 13 excluded

Pinned 100-game exact mapping after provider filtering:
- 82 safe
- 1 ambiguous
- 17 unresolved by exact title/alias

The unresolved set is largely regional/alternate naming and special-edition naming, not proof of missing provider coverage.

The next step is a non-destructive full-catalogue dry import with explicit review outputs.


## IGDB full catalogue dry importer ready — 6 October 2026

Implemented:
- `scripts/igdb-dry-import.mjs`
- `.github/workflows/igdb-full-catalogue-dry-import.yml`
- `IGDB_FULL_CATALOGUE_DRY_IMPORT.md`

The dry importer preserves the existing 100 stable IDs and PALScout coverage, imports no live artwork, writes no D1 data, and emits only proposed/review artifacts.

Existing seeds can receive at most one automatically selected IGDB mapping; competing provider alias rows are held for review rather than overwritten.


### First full-catalogue dry import failure — 6 October 2026

The first dry-import workflow successfully fetched all three platform populations and constructed a proposed 8,441-game catalogue, but validation failed because one IGDB record produced a release year outside the catalogue's allowed 1980–2100 range.

Observed pre-fix dry-run summary:
- original seed games: 100
- proposed total games: 8,441
- new BASE_ONLY games: 8,341
- enriched seed games: 91
- seed games without exact provider mapping: 9
- held provider records: 38
- suppressed same-title records: 16
- provider same-title review groups: 33
- seed ambiguities: 3
- ID collisions: 0

Fix:
- invalid provider years are now normalized to null
- the anomalous provider record is added to the review report
- workflow artifacts upload even when a future validation failure occurs

No canonical catalogue or D1 data was modified.


## Successful IGDB full-catalogue dry import — 6 October 2026

The first valid full dry import completed:
- 8,441 proposed catalogue games
- 8,341 new BASE_ONLY games
- 91/100 PALScout seeds automatically enriched
- 9 seed mappings remaining
- 38 provider records safely held
- 16 same-title records suppressed
- 33 provider title-collision review groups
- 3 seed ambiguity review events
- 0 ID collisions
- catalogue validation passed

Detailed result: `IGDB_DRY_IMPORT_RESULT_2026-10-06.md`.

The nine remaining seed mappings have now been made explicit in `catalogue/provider-mappings/igdb.json`.

The importer was also corrected to derive catalogue `releaseYear` from IGDB platform-specific `release_dates`, not global `first_release_date`.

A fresh dry run is required before canonical promotion.


## Final IGDB dry-import candidate passed — 6 October 2026

The refined dry import completed successfully with explicit regional-title mappings and platform-specific release years.

Final candidate:
- proposed total games: 8,433
- PS1: 3,710
- PS2: 4,019
- Dreamcast: 704
- BASE_ONLY: 8,333
- PALSCOUT_DEEP: 100
- enriched/mapped PALScout seeds: 100/100
- unmapped seeds: 0
- generated ID collisions: 0
- invalid release years: 0
- provider records held rather than guessed: 38
- same-title records suppressed under the conservative identity rules: 16
- provider same-title review groups: 33
- seed review notes: 3, all with a higher-confidence canonical selection already made
- catalogue validation: PASS

The compact browser search index generated from this candidate is approximately 1.37 MiB uncompressed and contains 7,512 aliases across 4,058 records with aliases.

Smoke checks confirm common/alternate searches including FF7, FFVII, MGS3, RE2, Forbidden Siren, Lucifer's Call, Project Zero 3, MediEvil 2 and Obscure II return the intended catalogue identities.

Promotion-validation logic is now codified in `scripts/validate-catalogue-promotion.mjs`.


### IGDB commercial partnership gate

Current IGDB documentation states that commercial usage is permitted through its commercial partnership process, the API price is free for both non-commercial and commercial projects, local caching/storage is allowed and preferred, and commercial integrations are expected to provide visible user-facing IGDB attribution.

Before the IGDB-backed full catalogue is published as part of GrailRaven's commercial product, contact IGDB at partner@igdb.com and complete/clarify the commercial partnership.

Technical catalogue work may continue behind this publication gate.


## Production UI v2 promotion — 6 October 2026

The approved Collector Intelligence visual direction is no longer preview-only.

Production changes:
- `index.html` uses the GrailRaven v2 navigation/brand treatment
- `search.html` uses the GrailRaven v2 navigation/brand treatment and production v2 skin
- shared approved design remains in `ui-v2.css`
- production bridge styles live in `production-v2.css`
- the raven mark and warm ivory GrailRaven wordmark from the approved preview are used in production navigation
- working Search/PALScout/Saved Hunts/account JavaScript hooks were preserved
- search copy explicitly supports title, abbreviation and alternate-name lookup
- regression tests protect the required production search IDs/scripts and v2 shell

A Cloudflare deployment is required for these changes to become visible on `grailraven.com`.


## Production v2 deployed successfully — 6 October 2026

Cloudflare deployment completed successfully after the production v2 integration.

Deployment verification:
- all 17 regression tests passed
- Cloudflare build completed successfully
- production static assets uploaded:
  - `production-v2.css`
  - `index.html`
  - `search.html`
- Worker deployment succeeded
- public brand environment remains GrailRaven
- D1 migration step reported no pending migrations
- build still intentionally uses the 100-game canonical catalogue; the 8,433-game IGDB candidate has not been promoted yet

Next manual verification:
- hard refresh `grailraven.com`
- confirm homepage shows the GrailRaven v2 shell
- open Search and confirm the functional Deal Finder uses the v2 styling
- verify mobile navigation and core form controls visually


## V2 layout correction after live review — 6 October 2026

The first production-v2 attempt was rejected during live review because it only skinned the old Search markup and left other app pages on their previous shells.

Correction:
- `search.html` has been rebuilt around the actual `design-preview.html` structure
- working Search/PALScout/Saved Hunts logic is preserved inside the approved v2 layout
- Saved Hunts, Account, Listing Checker, About, Privacy and Terms now share the GrailRaven v2 topbar and production visual system
- `tests/site-v2-contract.test.mjs` protects both the approved Search hierarchy and the shared site shell
- `UI_V2_DESIGN.md` now explicitly declares the preview markup as the layout authority, preventing future interpretation as a mere style reference

A new Cloudflare deployment is required before this corrected version is visible on grailraven.com.


## Search screenshot-parity correction — 6 October 2026

A second live comparison against the approved desktop/mobile screenshots found remaining structural drift:
- production had added a visible Search GrailRaven / Save Hunt row
- production replaced the approved result cards with a large green target card when no source was connected
- filter groups used simplified selects rather than the approved checkbox/toggle UI

Correction now implemented:
- production Search uses the approved preview composition almost verbatim
- visible Search/Save button row removed; search executes contextually (Enter/live source flow) and Save Hunt is surfaced contextually after a target is committed
- approved filter checkbox/toggle presentation restored
- approved result header + sort control restored
- approved example MATCH / REVIEW / FILTERED cards restored and explicitly labelled as example data until an authorised source exists
- demo banner is visible on desktop and hidden on mobile to match the approved references
- Saved Hunts, Account and Listing Checker were also moved onto stronger v2 page hierarchies rather than receiving only the v2 header

A new Cloudflare deployment is required.


## Live v2 screenshot parity verified — 6 October 2026

The corrected production Search page was deployed and manually compared against the approved desktop and mobile reference screenshots.

Result:
- desktop Search visually matches the approved design-preview composition
- mobile Search visually matches the approved reference composition
- the user confirmed the live result looks the same / all good
- Saved Hunts, Account and Listing Checker remain on the shared GrailRaven v2 shell

The v2 Search visual migration is therefore considered complete. Future changes should preserve the screenshot-parity contract recorded in `UI_V2_DESIGN.md`.


## Catalogue promotion + D1 sync pipeline ready — 6 October 2026

Built the post-approval full-catalogue promotion infrastructure while keeping publication blocked.

Architecture:
- immutable versioned D1 datasets
- SHA-256 manifest/checksum
- separate staging and activation
- single active-dataset pointer
- previous datasets retained for rollback
- existing D1 catalogue tables preserved

New migration:
- `backend/migrations/0003_catalogue_datasets.sql`

New tooling:
- `scripts/catalogue-promotion-core.mjs`
- `scripts/prepare-catalogue-promotion.mjs`
- `scripts/export-catalogue-d1.mjs`
- `scripts/verify-d1-catalogue.mjs`
- `scripts/activate-catalogue-dataset.mjs`
- `scripts/rollback-catalogue-dataset.mjs`

New workflows:
- `Validate catalogue promotion pipeline` — safe isolated local-D1 end-to-end test; may run now
- `Promote approved IGDB catalogue` — hard-gated by repository variable + typed confirmation
- `Roll back active D1 catalogue dataset` — emergency D1 pointer rollback

The approved remote promotion workflow remains inoperative until `IGDB_COMMERCIAL_APPROVED=true` is explicitly configured after the IGDB commercial-use question is resolved.

Detailed design: `CATALOGUE_PROMOTION_PIPELINE.md`.


## First promotion-pipeline validation finding — 6 October 2026

Safe workflow run 37540213154 failed at promotion-manifest preparation, after:
- regression tests passed
- fresh IGDB dry import succeeded
- promotion candidate validator passed at 8,433 games / 100 mapped PALScout deep games / 1.372 MiB search index

Root cause:
- the new promotion layer incorrectly assumed a provider game ID must be globally unique across the whole GrailRaven catalogue
- IGDB game IDs legitimately span multiple platforms, while GrailRaven canonical IDs are platform-specific
- example: IGDB 292078 = 240p Test Suite on both Dreamcast and PS1

Full-candidate audit:
- provider-reference rows: 8,433
- unique aliases after per-game normalization: 7,512
- cross-platform provider-ID reuse groups: 291
- same-platform provider-ID collisions: 0

Correction:
- provider ID reuse is allowed across different platforms
- the promotion safety check still rejects the same provider ID mapping to two canonical games on the same platform
- D1 v2 external-reference primary key now includes game_id
- migration 0004_catalogue_provider_refs.sql safely corrects the table shape if 0003 was previously applied
- regression coverage now tests both allowed cross-platform reuse and forbidden same-platform collision

The candidate itself remains valid; rerun the safe promotion-pipeline workflow.


## Promotion pipeline validated end-to-end — 6 October 2026

Safe GitHub Actions run: **37540728095**.

Every pipeline stage succeeded:
- regression tests
- fresh IGDB dry import
- promotion candidate validation
- promotion manifest generation
- immutable D1 SQL export
- isolated local D1 initialization
- full dataset staging
- staged-data verification
- local activation
- active-pointer verification
- audit artifact upload

Validated dataset:
- dataset ID: `cat-3faa2a84ad267ddd017c`
- SHA-256: `3faa2a84ad267ddd017c75cdd1437af9997150a9d8b407a66fd6a56e82703816`
- games: 8,433
- aliases: 7,512
- external refs: 8,433
- artwork: 0
- PS1: 3,710
- PS2: 4,019
- Dreamcast: 704
- BASE_ONLY: 8,333
- PALSCOUT_DEEP: 100
- cross-platform provider-ID reuse groups: 291
- search index: 1,438,335 bytes / 1.372 MiB
- all 100 PALScout deep IDs preserved
- changed seed identities: 0
- unmapped deep seeds: 0

The local D1 activation succeeded and the active pointer resolved to the validated dataset.

Publication status remains unchanged:
- `canonicalCatalogueModified=false`
- `remoteD1Activated=false`
- publication gate remains `IGDB_COMMERCIAL_APPROVAL_REQUIRED`

The promotion/D1 pipeline is therefore technically ready pending the IGDB commercial-use response.


## Full-catalogue search v1 ready for benchmark — 6 October 2026

Implemented a provider-independent forgiving catalogue search layer while preserving strict import/PALScout identity rules.

New:
- `shared/catalogue-search-core.js`
- `catalogue/search-aliases.json`
- `scripts/benchmark-catalogue-search.mjs`
- `.github/workflows/full-catalogue-search-benchmark.yml`
- `CATALOGUE_SEARCH_V1.md`

Search capabilities:
- exact titles
- partial/prefix search
- curated + provider aliases
- abbreviations/acronyms
- Roman/Arabic numeral equivalence
- in-order token search
- bounded typo correction
- explicit ambiguity handling
- curated suppression of misleading provider aliases

Production Search improvement:
- removes the future 8,433-option native datalist approach
- renders only the top six ranked suggestions
- autocomplete is keyboard accessible
- selecting a suggestion selects its platform
- the approved v2 screenshot composition is unchanged while autocomplete is closed

The full promotion workflow is now additionally gated on the search-quality/performance benchmark.

Next action: run `Benchmark full catalogue search` in GitHub Actions. Full IGDB data remains development-only.
