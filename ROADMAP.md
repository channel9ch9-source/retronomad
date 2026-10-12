# Current continuation — 29 September 2026

PriceCharting's 28 September approval supersedes the older roadmap entries that describe commercial permission as pending.

Completed in this continuation:
- [x] Record PriceCharting's approved RetroNomad launch arrangement in `PRICECHARTING_APPROVAL.md`
- [x] Confirm the documented PAL console namespaces for launch platforms
- [x] Build `backend/pricecharting-provider.js` without a real subscription token
- [x] Keep PriceCharting as an evidence provider; PALScout/shared matcher remain release authorities
- [x] Add strict PAL-console and exact title-family candidate filtering
- [x] Add `/api/product` UPC/EAN enrichment and `/api/offers` Marketplace normalization
- [x] Preserve USD offer price without inventing postage, delivered total or delivered GBP
- [x] Add provider throttling and short-lived cache behavior for documented API constraints
- [x] Add PriceCharting attribution metadata to normalized provider output
- [x] Add fixture regression suite; initial result 6/6 passed
- [x] Document the scaffold in `PRICECHARTING_PROVIDER_V1.md`
- [x] Update `PRICING_V1.md` to reflect approval and the new scaffold

Still required before real/public PriceCharting use:
- [x] Add visible PriceCharting attribution/linkback contract to PriceCharting result UI
- [x] Adapt/build the 100-title PriceCharting pricing coverage harness
- [x] Build a separate 100-title PriceCharting Marketplace offer-coverage harness
- [x] Add offline 100-game fixture validation for both PriceCharting benchmark modes
- [x] Add safe GitHub Actions harness-validation workflow
- [x] Add hard-gated real-token PriceCharting benchmark workflow
- [x] Pass safe offline PriceCharting harness validation (run 37667009943; 35/35 tests; 100 pricing + 100 offers)
- [ ] Only when ready for real validation, purchase the approved Legendary subscription
- [ ] Store `PRICECHARTING_TOKEN` only as a Cloudflare Worker secret
- [ ] Run the 100-title UK/PAL pricing benchmark
- [ ] Run the 100-title Marketplace offer benchmark
- [ ] Audit exact identifier/product-ID matches, PAL safety, completeness mapping and UK usefulness
- [ ] Decide from measured results whether to wire PriceCharting into the public Deal Finder and scheduled Saved Hunt monitor
- [ ] Keep eBay independent; do not assume PriceCharting Marketplace replaces eBay without coverage evidence

Immediate engineering action after this handoff:
**Verify the offline PriceCharting harness workflow. Keep the live Worker marketplace provider disabled. Purchase Legendary only when ready to run the real 100-title pricing + offer benchmarks.**

---

# Search-first product direction

## Phase 1 — Deal Finder + Wishlist alerts
- [x] Confirm RetroNomad as the primary search destination for buyers
- [x] Reframe manual listing checker as a secondary utility
- [x] Define PALScout as the UK/European classification engine under search results
- [x] Add public search.html Phase 1 shell using the 100-game launch catalogue
- [x] Add browser-local saved-target prototype without claiming active alerts
- [x] Replace bare saved targets with versioned Saved Hunts model
- [x] Add wishlist.html management UI
- [x] Add legacy saved-target migration, duplicate prevention and JSON export
- [x] Add pause/archive/delete and future-alert preference state
- [x] Add foreground last-checked + match-history support
- [x] Reopen Saved Hunts directly in the Deal Finder search form
- [x] Add marketplace-source.js provider registry and normalised listing schema
- [x] Add reusable palscout-classifier.js for marketplace candidates
- [x] Preserve item specifics, condition, identifiers and language signals in normalised marketplace rows
- [x] Add search-pipeline.js: provider -> PALScout -> matcher -> ranked results
- [x] Run synthetic end-to-end pipeline QA with MATCH / REVIEW / FILTERED outcomes
- [x] Add strict Match / Review / Filtered search matcher
- [x] Regression-test representative UK PAL, shared PAL, NTSC, edition, completeness, price and ambiguity cases
- [x] Document the search/result contract in MARKETPLACE_V1.md
- [x] Design the search form, launch filters and search-results card
- [x] Define the listing-normalisation / marketplace-source abstraction
- [ ] Keep eBay integration disabled until legitimate developer access is available
- [ ] Connect a trusted release-safe pricing source after classification
- [x] Build Saved Hunts / wishlist foundation in the browser
- [x] Add provider-neutral scheduled monitor core
- [x] Add D1/SQLite persistence schema for server-side hunts, matches, monitor runs and notification queue
- [x] Add Cloudflare Worker-style scheduler scaffold with health/admin-test endpoints
- [x] Regression-test new-match deduplication, paused hunts and alert-request rules
- [x] Build passwordless account/session implementation
- [x] Build authenticated browser-to-backend Saved Hunt sync
- [x] Add deletion tombstones so multi-device sync cannot resurrect removed hunts
- [x] Add Account UI + wishlist sync controls + search save/sync hook
- [x] Add same-origin Cloudflare Worker + Static Assets deployment build
- [x] Add automated D1 create/resolve + migration tooling
- [x] Add manual GitHub Actions scaffold deployment workflow
- [x] Keep GitHub Pages runtime local-only while Cloudflare build enables account sync
- [x] Add Cloudflare API token + account ID as GitHub Actions secrets
- [x] Run first Cloudflare scaffold deployment
- [x] Smoke-test workers.dev static site, /health, D1 binding and account endpoints
- [x] Deploy mobile navigation fix to Cloudflare
- [x] Implement Resend auth-email delivery in Worker
- [x] Create Resend sending-only API key and add GitHub secret `RESEND_API_KEY`
- [x] Redeploy and confirm /health reports Resend configured
- [x] Complete first passwordless sign-in + Saved Hunt sync smoke test
- [x] Deploy cross-device auto-sync and email-threading fixes
- [x] Re-test cloud Saved Hunt appearing on phone and repeated sign-in email rendering
- [x] Verify Saved Hunt deletion/tombstone propagation across devices
- [x] Before public account launch, verify a GrailRaven-owned sending domain and add stronger abuse protection
- [ ] Later move from workers.dev to a production/custom domain when appropriate
- [ ] Configure transactional sign-in email delivery + abuse/rate controls
- [ ] Update privacy/account-data policy before enabling public accounts
- [x] Add server-compatible PALScout + matcher execution
- [x] Extract shared PALScout + matcher cores used by Deal Finder and backend monitor
- [x] Add backend/search-engine.js to classify and rank normalised provider candidates
- [x] Parity-test all 217 shared release-evidence rows against browser evidence
- [x] Regression-test shared browser/server rules with representative MATCH / REVIEW / FILTERED cases
- [ ] Later: migrate rich analyze.html Phase 2 logic onto shared core without losing photo/OCR evidence
- [ ] Connect an authorised live marketplace inventory adapter
- [ ] Enable autonomous scheduled monitoring only after auth + live inventory are configured
- [ ] Add real notification delivery after user identity/contact verification exists

## Phase 2 — "Should I buy this?"
- [x] Core listing classifier prototype exists
- [x] PALScout compatibility verdict exists
- [ ] Rework analyser UX as a secondary decision-support tool
- [ ] Add trusted exact-release pricing comparison

## Phase 3 — Photo / Lot Analyzer
- [ ] Batch photo ingestion
- [ ] Multi-game identification
- [ ] Per-item release / completeness / value estimation
- [ ] Highlight items worth closer inspection

## Phase 4 — Expansion
- [ ] More authorised marketplaces
- [ ] NTSC-U / US regional intelligence
- [ ] NTSC-J / Japan regional intelligence
- [ ] Advanced collector features


# RetroNomad Roadmap

Last updated: 29 September 2026

This file tracks completed work, the active milestone, blockers and the order of future development.

## Product objective

Build RetroNomad into a trustworthy physical-game discovery assistant that can:

1. identify the exact physical release
2. determine whether the listing is comparison-ready
3. attach an appropriate reference price only after identity is safe
4. eventually discover authorised marketplace listings
5. let users track wanted releases and target prices

The order matters. Discovery and alerts are not useful if release identity is unreliable.

---

# Completed foundation

## Brand and public site
- [x] RetroNomad selected as parent brand
- [x] PALScout selected as UK/PAL regional intelligence layer
- [x] tagline established: "Find the right copy. Wherever it was released."
- [x] public GitHub Pages site
- [x] public analyser

## Launch reference data
- [x] 100-game launch scope
- [x] PS1: 40
- [x] PS2: 40
- [x] Dreamcast: 20
- [x] identifier-level release evidence
- [x] market-aware UK/PAL buckets
- [x] important country/shared-release exceptions documented

## Listing analyser
- [x] title + description input
- [x] generic URL ingestion where possible
- [x] eBay item-ID/title fallback
- [x] platform inference
- [x] completeness inference
- [x] edition detection
- [x] serial/barcode extraction
- [x] photo upload
- [x] local OCR
- [x] gallery component confirmation
- [x] condition flags
- [x] foreign-region veto
- [x] bundle handling
- [x] demo/promo separation
- [x] Comparison-ready / Review / Separate statuses

## Classifier benchmark
- [x] real/current-or-recent 50-listing benchmark
- [x] critical false-READY failure identified
- [x] classifier hardening
- [x] fixed benchmark full-detail rerun: 50/50 status matches
- [x] zero false-READY cases on that benchmark
- [x] limitation documented: not universal accuracy

## Pricing v1 manual layer
- [x] manual source-backed references
- [x] exact comparison keys
- [x] local persistence
- [x] pricing gate
- [x] descriptive comparison language
- [x] pricing schema

## Pricing v1 automatic beta
- [x] RetroTechCollector selected as first pilot provider
- [x] browser BYOK connector
- [x] sessionStorage-only key handling
- [x] catalogue search
- [x] PAL/platform filtering
- [x] supported condition-bucket mapping
- [x] USD→GBP conversion
- [x] weak/ambiguous provider match rejection
- [x] conflicting UPC/title rejection
- [x] serverless production proxy template
- [x] 100-title pricing coverage runner

## Durable project handoff
- [x] PROJECT_STATE.md
- [x] PRICING_V1.md
- [x] DECISIONS.md
- [x] ROADMAP.md

---

# Completed milestone — RetroTechCollector Pricing v1 provider validation

## Goal
Determine whether RetroTechCollector is sufficiently complete and reliable for RetroNomad's initial 100-title PAL launch scope.

## Step 1 — test API access
The real-key pilot was completed without exposing or committing the key.

## Step 2 — coverage lab
Open:
`pricing-coverage.html`

- [x] Connect the developer key
- [x] Run the first 100-title pass
- [x] Reach 100/100 attempted titles
- [x] Export and inspect the first JSON report
- [x] Identify that the original harness collapsed every result into NO_PAL_MATCH after filtering
- [x] Add diagnostic v2 with raw candidate capture and separate platform/region mismatch states
- [x] Rerun all 100 titles with diagnostic v2
- [x] Export and inspect the diagnostic-v2 JSON report
- [x] Confirm provider platform-label mismatch and nullable region behaviour
- [x] Confirm UPC catalogue coverage is extremely sparse in this test
- [x] Add diagnostic v3 using the provider price endpoint first
- [x] Run all 100 titles with diagnostic v3
- [x] Export and inspect the diagnostic-v3 JSON report
- [x] Decide provider fit: RetroTechCollector is limited to exact-identifier supplemental use, not the primary UK/PAL source
- [x] Harden analyser and worker so failed exact PAL barcode lookups cannot fall back to another region's title price

## Step 3 — audit results
Final v3 outcome:
- [x] 1 safe exact UPC/EAN price match
- [x] 33 strong title/platform matches rejected because region was unknown
- [x] 62 no usable provider matches
- [x] 4 weak matches
- [x] no explicitly PAL title-price matches
- [x] provider limitation documented rather than hidden

Rules:
- do not force 100% coverage by weakening ambiguity thresholds
- do not guess missing UPCs
- do not relabel foreign editions to improve coverage
- preserve review states where evidence is genuinely ambiguous

## Step 4 — close provider pilot
- [x] fix evidence-supported platform mapping defects
- [x] document provider gaps
- [x] record final launch-scope coverage statistics in PROJECT_STATE.md
- [x] preserve strict ambiguity/region rules instead of forcing coverage

---

# Product clarity work

- [x] Add a dedicated PALScout compatibility verdict to the analyser
- [x] Separate PAL hardware compatibility from UK-market/country classification
- [x] Keep NTSC-U/NTSC-J, PAL territory, language/package and collector-market signals distinct
- [x] Redesign homepage messaging/layout around the simple customer journey: check compatibility → identify exact release → check completeness → compare value
- [ ] Add concise examples showing UK/EU, US and Japanese release use cases

# PALScout compatibility QA

- [x] Add PAL/NTSC compatibility verdict
- [x] Test UK exact PAL, continental PAL, NTSC-U, NTSC-J and unknown-region cases
- [x] Fix PAL+NTSC conflict handling so mixed evidence becomes review
- [x] Fix common negated wording such as "UK PAL - not NTSC-US"
- [x] Use PlayStation serial prefixes as region evidence without treating PAL-Europe as UK-specific
- [x] Run serial-prefix regression cases for SLES/SCES, SLUS/SCUS and Japan/Asia-family prefixes
- [x] Restore listing URL ingestion helpers that had been dropped from the current analyser
- [x] Smoke-test eBay URL item-ID/title parsing and Vinted source detection
- [x] Browser smoke-test exposed a hanging direct eBay metadata request
- [x] Add a 6-second timeout + graceful fallback to listing URL import
- [x] Re-test exposed a post-fetch UI hang on the eBay path
- [x] Replace eBay direct browser fetch with immediate URL-only fallback
- [x] Re-test the public analyser with a real eBay link: immediate recognition worked and item ID was recovered; title remains unavailable when the URL itself contains no usable title slug

# Active milestone — PriceCharting release-safe pricing + Marketplace validation

## Commercial route
- [x] Confirm public PAL product catalogue exists with dedicated PAL platform namespaces and PAL EAN/GTIN records
- [x] Confirm standard API/CSV terms are internal-use only without commercial approval
- [x] Identify PriceCharting's official commercial-permission route
- [x] Draft and send the RetroNomad commercial-data enquiry (23 Sep 2026)
- [x] Obtain explicit approval for the described public pricing use and Marketplace-offer display/linking (recorded 28 Sep 2026)
- [x] Record approved launch arrangement and attribution requirement in `PRICECHARTING_APPROVAL.md`
- [x] Build the server-side provider scaffold without purchasing a subscription/token
- [x] Add fixture QA and provider implementation handoff
- [ ] Add visible attribution/linkback UI
- [ ] Purchase Legendary only when ready for real validation
- [ ] Store the token only as a server-side Cloudflare secret

## Provider acceptance test
PriceCharting must still:
- distinguish PAL from NTSC-U/NTSC-J in real results
- support enough of the 100-title launch set to be useful
- expose exact identifiers or release-specific product IDs often enough to be safe
- preserve the approved public-app/licensing path and attribution terms
- survive the 100-title coverage benchmark before production use

## Pricing benchmark
- [ ] adapt the existing coverage lab to PriceCharting's contract
- [ ] attempt all 100 launch titles
- [ ] prefer exact UPC/EAN/product-ID evidence
- [ ] measure loose/CIB/new/box/manual field coverage
- [ ] record ambiguous or region-unsafe matches as such rather than forcing coverage
- [ ] manually spot-check successful release matches

## Marketplace offer benchmark
- [ ] build a separate offer-coverage runner
- [ ] query available offers only through the approved API
- [ ] classify every offer through PALScout/shared matcher
- [ ] measure current offer volume by launch title/platform
- [ ] measure how often UPC/EAN/product identity is strong enough for MATCH vs REVIEW
- [ ] measure completeness/condition usefulness
- [ ] measure practical usefulness for UK buyers
- [ ] do not equate USD item price with delivered GBP

# Later milestone — End-to-end listing → price validation

After PriceCharting passes the launch benchmark:

- [ ] take a sample of real listing inputs
- [ ] classify through the normal analyser/search pipeline
- [ ] verify exact release/completeness key
- [ ] verify provider release match
- [ ] verify correct completeness price field
- [ ] verify GBP reference conversion
- [ ] verify ambiguous listings do not receive automatic prices
- [ ] verify foreign-region listings remain blocked from UK comparison paths

Exit criterion:
A representative sample must complete the full chain without known identity-to-price mismatches.

---

# Wishlist + target-price alerts

Backend/account persistence now exists, but live autonomous alerts still require validated authorised inventory and a real notification-delivery provider.

- [x] define Saved Hunt data model
- [x] store exact wanted release/constraints rather than only game title
- [x] allow target delivered price
- [x] allow completeness preference
- [x] support alert-requested state without falsely claiming delivery
- [x] avoid alerts when listing identity is unresolved
- [ ] validate a live authorised marketplace provider
- [ ] add real notification channel(s)
- [ ] enable autonomous scheduled monitoring only after those dependencies are ready

---

# Marketplace discovery

## PriceCharting Marketplace
Current state:
**Commercial/public-use approval obtained; server-side adapter scaffold built; no real token/coverage benchmark yet; public provider remains disabled.**

Next:
- [ ] attribution UI
- [ ] real-token offer coverage benchmark
- [ ] measured UK usefulness review
- [ ] production wiring only if benchmark supports it

## eBay
Current state:
**No authorised eBay developer access yet. Earlier developer application was rejected after appeal; a legitimate reconsideration request was submitted through eBay's rejected-registration support path on 11 October 2026.**

Do not:
- evade the rejection
- scrape protected data as a substitute for authorised API use
- create misleading accounts
- spam applications

Progress:
- [x] maintain a functioning public GrailRaven product
- [x] prepare a concise authorised Buy Browse API use case
- [x] reapply from a materially stronger legitimate position
- [x] use accurate identity/business/project information
- [x] reference business-domain contact email and live grailraven.com product
- [x] state that GrailRaven will not scrape or bypass eBay controls
- [x] receive eBay reconsideration response — rejected almost immediately under unspecified internal eligibility/risk controls
- [ ] park further eBay applications for now
- [ ] strengthen public product / catalogue / authorised provider integrations / real-user evidence
- [ ] reconsider transparent reapplication later from a materially stronger position
- [ ] if eventually approved, build/test the eBay adapter in Sandbox
- [ ] pursue the appropriate production-access review

The classifier must remain marketplace-independent so users can paste listing data manually even without eBay API access.

## Other marketplaces
- [ ] research marketplaces with documented developer/API access
- [ ] assess terms before implementation
- [ ] keep discovery adapters separate from release classification

---

# Geographic/platform expansion

After UK/PAL launch flow is stable:

## Regions
- [ ] NTSC-U
- [ ] NTSC-J
- [ ] country-specific release intelligence beyond current PAL launch scope

## Platforms
Expand only with evidence-backed reference data and validation.

Potential future systems should not be added merely to inflate catalogue size.

---

# Accounts and cloud persistence

Current state:
- [x] passwordless email sign-in deployed
- [x] secure same-origin session flow deployed
- [x] Saved Hunts sync deployed
- [x] cross-device sync verified
- [x] deletion/tombstone propagation verified

Before broader public launch:
- [x] verify a GrailRaven-owned sending domain — `grailraven.com` Verified in Resend
- [x] add stronger passwordless sign-in abuse protection
- [x] update privacy/account-data policy
- [ ] later move to a production/custom domain when appropriate

---

# Ongoing quality rules

At every milestone:
- [ ] no fabricated deal results
- [ ] no invented benchmark gains
- [ ] no "Good Deal" label without a trustworthy reference basis
- [ ] no automatic price on unresolved identity
- [ ] no hidden fallback that converts ambiguity into a guess
- [ ] benchmark claims must name the benchmark/population
- [ ] update durable handoff files when state changes

---

# Immediate next action

**Add visible PriceCharting attribution support, then build the PriceCharting pricing and Marketplace coverage harnesses. Keep the live Worker marketplace provider disabled until the real-token benchmarks have been run and audited.**

Do not fabricate inventory, scrape around marketplace restrictions, weaken release-identity rules, or buy the subscription earlier than needed for real validation.


## GrailRaven UI V2 — active design milestone (6 October 2026)

A non-production design preview is being used to establish the visual system before replacing the working UI.

Selected direction: Collector Intelligence.

Locked feedback from the first live preview:
- replace murky dark-blue base with near-black / charcoal
- active/MATCH green: `#00FF41`
- REVIEW orange: `#FF5F1F`
- FILTERED red: `#880808`
- replace blue checkbox/toggle/active accents with green
- use a more characterful gothic/old-world display type treatment while keeping UI text readable
- use the more elegant raven emblem direction from the second mockup
- mobile must be simplified rather than merely stacking the desktop layout
- mobile filters should collapse behind a Filters control
- mobile cards should hide secondary evidence by default and prioritize status, release and price

Authoritative design detail: `UI_V2_DESIGN.md`.

Exit criteria for this milestone:
1. revised preview works cleanly on desktop and phone
2. user approves overall visual direction
3. final/near-final logo direction is selected
4. shared style/components can then be migrated to the working Search page without changing core PALScout/Saved Hunts/account logic


### UI V2 visual work parked after cleanup — 6 October 2026

Final requested cleanup before pausing visual work:
- REVIEW orange changed to `#FF5C00`
- FILTERED red changed to `#FF0023`
- green removed from generic search/check/navigation highlights; neutral white/grey used for now
- main/panel background moved to plain black
- hero restored to a game-art-driven structure with a safe placeholder until a legitimate catalogue artwork source is chosen
- preferred raven mark from the second mockup used in the preview instead of the rejected approximation
- mobile primary navigation changed from horizontal scrolling to a Menu dropdown with vertically listed options
- typography remains deliberately unresolved

Next priority after this preview check: resume full PS1 / PS2 / Dreamcast catalogue architecture and core app work rather than continuing aesthetic iteration.


## Full catalogue architecture v1 — 6 October 2026

Architecture foundation implemented:
- [x] Separate base game catalogue from PALScout exact-release evidence
- [x] Define canonical v1 game schema for PS1 / PS2 / Dreamcast
- [x] Seed canonical catalogue with the existing 100 benchmark games
- [x] Preserve 40 PS1 / 40 PS2 / 20 Dreamcast benchmark population
- [x] Add release-intelligence coverage states: BASE_ONLY / PALSCOUT_PARTIAL / PALSCOUT_DEEP
- [x] Add shared catalogue validation/search-index core
- [x] Generate a compact browser search index instead of shipping full metadata to every page
- [x] Decouple Search autocomplete from release-evidence rows
- [x] Add D1 catalogue tables for games, aliases, external refs, artwork rights and import audit runs
- [x] Add catalogue regression tests
- [x] Document architecture in `CATALOGUE_V1.md`

Next catalogue work:
- [ ] Evaluate legitimate full-catalogue metadata sources and terms for PS1 / PS2 / Dreamcast
- [ ] Evaluate legitimate cover-art sources/usage terms separately
- [ ] Select primary source and optional supplemental sources
- [ ] Build source-specific importer with collision/review reporting
- [ ] Expand one platform at a time while keeping the 100-game benchmark pinned
- [ ] Build public Catalogue browse/detail UI after data import is stable


### Catalogue source selection — 6 October 2026

Initial source review completed.

Current direction:
- [x] IGDB selected as first catalogue source to benchmark
- [x] MobyGames retained as a possible later supplemental/validation source, but commercial pricing is too high for primary pre-revenue use
- [x] RAWG retained as fallback pending clearer need/terms
- [x] ScreenScraper excluded as primary commercial source because public community data/media uses non-commercial licensing
- [x] Giant Bomb excluded as primary source without written commercial permission
- [ ] Create IGDB developer credentials
- [ ] Build read-only IGDB coverage/import benchmark
- [ ] Compare IGDB coverage against the 100-game pinned benchmark
- [ ] Audit covers, aliases, duplicates and platform completeness
- [ ] Only then decide whether IGDB becomes the primary full-catalogue importer

Details: `CATALOGUE_SOURCE_EVALUATION.md`.


### IGDB inventory benchmark — ready to run

- [x] Build full-platform paginated read-only IGDB inventory harness
- [x] Add exact canonical/alias-only safe resolver
- [x] Add ambiguous-name/alias collision reporting
- [x] Add non-authoritative review candidates for unresolved benchmark rows
- [ ] Run platform-wide IGDB inventory benchmark
- [ ] Inspect complete PS1 / PS2 / Dreamcast populations and collisions
- [ ] Define safe filtering rules for non-retail/version/noise records
- [ ] Decide whether IGDB is suitable for first dry-run full catalogue import


### IGDB dedup/filter benchmark — ready to run

The platform inventory showed strong coverage but also duplicate/version ambiguity. Next gate:
- [x] inspect IGDB `version_parent` and `game_type`
- [x] create provisional include/review/exclude buckets
- [x] re-test pinned 100 after edition/version filtering
- [ ] run IGDB dedup/filter benchmark
- [ ] audit remaining ambiguous/unresolved benchmark titles
- [ ] freeze v1 provider-filter rules
- [ ] build first dry-run catalogue importer only after this gate passes


### IGDB full catalogue dry import — ready

- [x] corrected provider game-type filtering
- [x] retain existing 100 seed IDs and PALScout coverage
- [x] add conservative same-title provider collision handling
- [x] ensure at most one automatic IGDB mapping per existing seed
- [x] keep IGDB artwork out of canonical/live data pending commercial-use decision
- [x] generate proposed catalogue + review report only
- [ ] run dry-import workflow
- [ ] inspect proposed totals, seed mapping gaps and collision groups
- [ ] create explicit provider mapping overrides for approved regional-title cases
- [ ] only then decide whether to promote a generated catalogue into canonical data


### First full dry import passed; mapping/date refinement in progress

- [x] first proposed full catalogue validated at 8,441 games
- [x] zero generated ID collisions
- [x] audit nine unmatched PALScout seed games
- [x] add explicit IGDB mappings for all nine regional-title/provider-name cases
- [x] add tests for explicit mapping integrity
- [x] switch release-year derivation to platform-specific IGDB release dates
- [ ] rerun full dry import with explicit mappings + platform-specific dates
- [ ] confirm 100/100 seed enrichment and revised proposed total
- [ ] review remaining provider same-title groups
- [ ] build canonical promotion path only after the rerun passes


### Final catalogue candidate validation

- [x] refined full dry import passed
- [x] 8,433-game proposed catalogue validates
- [x] 100/100 PALScout seeds mapped
- [x] platform-specific release years
- [x] zero generated ID collisions
- [x] compact browser index measured at ~1.37 MiB
- [x] shorthand/alternate-name search smoke checks passed
- [x] codify promotion candidate validator
- [ ] contact IGDB commercial partnerships and confirm attributed GrailRaven use
- [ ] after commercial-use gate is cleared, promote approved candidate into canonical catalogue
- [ ] rebuild committed browser catalogue index
- [ ] sync canonical catalogue to D1
- [ ] deploy and verify public search performance


### Production v2 UI integration

- [x] apply approved GrailRaven v2 shell to production homepage
- [x] apply approved GrailRaven v2 shell to functional Search page
- [x] preserve Search/PALScout/Saved Hunts/account hooks
- [x] add forgiving-search user copy
- [x] add production UI integrity tests
- [x] deploy updated app to Cloudflare
- [ ] verify grailraven.com homepage and Search on desktop/mobile
- [ ] then continue IGDB commercial-partnership outreach and catalogue promotion


### Correct v2 production migration

- [x] declare design-preview markup as production layout authority
- [x] rebuild Search using the approved v2 structure rather than old-panel skinning
- [x] preserve functional Search/PALScout/Saved Hunts hooks
- [x] apply v2 shell to Saved Hunts
- [x] apply v2 shell to Account
- [x] apply v2 shell to Listing Checker
- [x] apply v2 shell to About / Privacy / Terms
- [x] add site-wide v2 layout regression contract
- [ ] deploy corrected v2 production UI to Cloudflare
- [ ] verify Search against approved mobile/desktop preview
- [ ] verify Saved Hunts / Account / Listing Checker mobile navigation
- [ ] then resume IGDB commercial-partnership outreach


### Screenshot-parity correction

- [x] compare live Search against approved desktop/mobile screenshots
- [x] remove production-only hero Search/Save row
- [x] remove permanent green target card from approved result composition
- [x] restore checkbox/toggle filter rail
- [x] restore Sort control and example result cards
- [x] preserve functional search, aliases, Saved Hunts and marketplace hooks behind approved UI
- [x] strengthen Saved Hunts / Account / Listing Checker v2 page hierarchy
- [x] deploy screenshot-parity correction
- [x] compare live desktop Search against reference screenshot
- [x] compare live mobile Search against reference screenshot


### Catalogue promotion + D1 sync pipeline

- [x] design immutable versioned D1 catalogue datasets
- [x] add D1 v2 dataset migration
- [x] add candidate checksum/manifest generation
- [x] add idempotent D1 stage exporter
- [x] add staged-data verification
- [x] add gated activation command
- [x] add D1 dataset rollback command
- [x] make catalogue regression tests compatible with >100 canonical games
- [x] add safe local end-to-end promotion workflow
- [x] add hard-gated remote promotion workflow
- [x] verify full 8,433-game D1 stage / activate / pointer flow
- [x] run safe local promotion-pipeline validation
- [x] fix first provider-reference schema finding (cross-platform IGDB ID reuse)
- [x] rerun safe local promotion-pipeline validation
- [x] fix any further CI/D1 issues found by that run
- [x] receive positive IGDB commercial partnership response
- [ ] only after approval, set `IGDB_COMMERCIAL_APPROVED=true`
- [ ] run approved remote promotion workflow


### Full-catalogue search quality

- [x] separate forgiving user search from strict import identity matching
- [x] add provider-independent curated alias layer
- [x] add misleading-alias suppression layer
- [x] add exact / alias / acronym / prefix / token ranking
- [x] add Roman/Arabic numeral equivalence
- [x] add bounded typo correction
- [x] add ambiguity detection
- [x] replace large native datalist strategy with top-six ranked autocomplete
- [x] add keyboard-accessible autocomplete
- [x] add 24-case full-catalogue search benchmark
- [x] add search performance regression budgets
- [x] pass 24/24 full-catalogue search quality cases
- [x] gate future full-catalogue promotion on search benchmark
- [x] fix stale pre-benchmark alias assertion
- [x] rerun full 8,433-game search benchmark
- [x] review benchmark ambiguity/typo cases
- [x] deploy autocomplete improvement to current 100-game public Search after benchmark passes


### IGDB partnership agreement

- [x] receive positive commercial partnership response
- [x] confirm API remains free under partnership
- [x] confirm local storage/retention rights
- [x] confirm future Data Dump access
- [x] confirm user-facing IGDB.com attribution requirement
- [x] send requested partnership details to IGDB
- [ ] receive legal agreement
- [ ] review/sign agreement
- [ ] record any additional conditions in repo
- [ ] only after agreement confirmation set `IGDB_COMMERCIAL_APPROVED=true`


### Canonical Search selection state

- [x] replace marketplace dead-end status with canonical game confirmation
- [x] show title / platform / year / PALScout coverage
- [x] show how the query matched
- [x] keep Save Hunt available before marketplace integration
- [x] reject no-match raw-text hunt creation
- [x] require explicit choice for ambiguous catalogue searches
- [x] hide demo listing cards only after a real game is identified
- [x] preserve approved idle Search composition
- [x] deploy to current 100-game production catalogue


### Public Catalogue v1

- [x] create dedicated `catalogue.html` public browse page
- [x] use current compact canonical catalogue index rather than full metadata documents
- [x] add PS1 / PS2 / Dreamcast filtering
- [x] add title / alias / abbreviation search
- [x] add title and release-year sorting
- [x] render a bounded 36 records per page
- [x] add canonical-ID game detail routes
- [x] show title / platform / release year when source-backed / aliases / PALScout coverage
- [x] keep artwork intentionally unavailable pending provider-rights clarity
- [x] wire Find this game to exact canonical Search target
- [x] wire Save Hunt to exact canonical Search target
- [x] preserve canonical catalogue ID in browser and cloud Saved Hunts
- [x] update public navigation to dedicated Catalogue page
- [x] add Catalogue regression contract
- [x] deploy behind 100-game PALScout publication guard
- [x] pass 40/40 regression tests in production deployment
- [x] remove one-time deployment workflow

Future after IGDB agreement:
- [ ] feed the approved 8,433-game canonical index into the same Catalogue UI
- [ ] re-run full-catalogue UI/search performance checks
- [ ] add provider-backed metadata fields only where agreement/rights permit
- [ ] add artwork only after artwork rights are explicitly acceptable


### Artwork feature-flag architecture

- [x] define rights-aware public artwork payload
- [x] align artwork fields with existing D1 artwork model
- [x] require APPROVED rights status for public eligibility
- [x] add independent build/runtime artwork feature flag
- [x] default artwork flag to false
- [x] omit artwork URLs entirely from public compact index when flag is false
- [x] add dormant cover slots to Catalogue cards
- [x] add dormant artwork slot to Catalogue detail view
- [x] add dormant game-specific artwork slot to Search hero
- [x] add attribution display hooks
- [x] add broken-image fallbacks
- [x] add artwork-gate regression tests
- [x] deploy dormant architecture with artwork explicitly disabled
- [x] pass 44/44 regression tests
- [ ] confirm provider/artwork rights in IGDB agreement
- [ ] populate approved artwork records
- [ ] audit representative covers/attribution
- [ ] enable `CATALOGUE_ARTWORK_ENABLED=true` only after rights review


### Account/public-launch hardening v1

- [x] audit live passwordless sign-in security
- [x] retain per-email sign-in throttling
- [x] add cross-address/client spray throttling
- [x] avoid storing raw client addresses in auth-rate table
- [x] rotate derived client buckets daily
- [x] prune short-lived rate events after about 24 hours
- [x] add additive D1 auth-rate migration
- [x] update Privacy for live accounts/Saved Hunt sync
- [x] document Cloudflare + Resend processing roles
- [x] remove stale no-accounts privacy wording
- [x] correct deployed Worker health state
- [x] add auth-hardening regression tests
- [x] pass 51/51 production regression tests
- [x] deploy hardened Worker and migration
- [x] remove one-time deployment workflow

Remaining before broader public launch:
- [x] verify/confirm production sending-domain status in the email provider — `grailraven.com` Verified in Resend on 11 Oct 2026
- [x] add self-service account deletion UI/API
- [ ] re-review Terms/Privacy before any analytics, advertising, payments or autonomous notifications are enabled


### Self-service account deletion

- [x] add authenticated account-deletion endpoint
- [x] require exact typed `DELETE` confirmation
- [x] scope all deletion to authenticated user identity
- [x] delete cloud Saved Hunts and owned monitor/match/notification data
- [x] delete outstanding auth tokens
- [x] delete all account sessions
- [x] delete user account row
- [x] clear session cookie after deletion
- [x] clear current browser Saved Hunts/tombstones/device ID after success
- [x] update Privacy notice
- [x] add database-scope and UI/API regression tests
- [x] pass 56/56 production regression tests
- [x] deploy behind existing 100-game / artwork-off safety gates
- [x] remove one-time deployment workflow


### Business direction and validation discipline — 9 October 2026

Durable strategy: `BUSINESS_DIRECTION.md`.

Primary objective:
- build GrailRaven into a financially meaningful, sustainable software business
- do not optimise for feature count or treat the project primarily as a hobby/portfolio exercise

Decision filter for major work:
- [ ] does it improve acquisition?
- [ ] does it improve retention?
- [ ] does it improve willingness to pay?
- [ ] does it improve defensibility?

Standing product wedge:
- exact-copy acquisition intelligence
- Search → Filter → Compare → Alert
- PALScout precision / evidence / MATCH-REVIEW-FILTERED trust model
- do not compete by indiscriminately cloning general collection-tracker features

Near-term business sequence:
1. [ ] receive/review IGDB partnership agreement
2. [ ] if acceptable, promote approved 8,433-game catalogue and permitted artwork
3. [ ] run real PriceCharting pricing + Marketplace benchmark when ready to pay
4. [ ] connect marketplace inventory only if benchmark quality is adequate
5. [ ] complete useful Search → Filter → Compare → Alert loop
6. [ ] begin active collector acquisition / behavioural validation
7. [ ] reapply for eBay developer access from a materially stronger public-product position
8. [ ] test freemium / Collector subscription willingness to pay
9. [ ] consider mobile/PWA/native app only after usage evidence supports it

Validation principle:
- after the useful marketplace product exists, prefer a 3–6 month measured acquisition/retention/payment validation period over indefinite private feature development
- if real retention and willingness to pay are strong, accelerate
- if serious distribution produces weak retention/payment intent, reassess positioning/model rather than endlessly adding features

Monetisation direction:
- Free acquisition tier
- paid Collector tier, provisional target approximately £3.99/month or £35–£40/year subject to validation
- later Trader/Professional tier only after consumer fit
- possible affiliate/referral/API/dealer revenue where permitted and trust-compatible
- advertising is not the primary model
- do not build a full GrailRaven marketplace without strong evidence

Mobile direction:
- mobile app is a future opportunity for push alerts, barcode/photo scanning and marketplace-share workflows
- do not divert into separate native iOS/Android development before web product-market fit


### www hostname — completed 9 October 2026

- [x] apex `grailraven.com` confirmed working by user
- [x] diagnose why `www.grailraven.com` did not load
- [x] add proxied `www` DNS record
- [x] make `www.grailraven.com` resolve
- [x] redirect `www` → `https://grailraven.com` with HTTP 301
- [x] preserve request path and query string
- [x] verify Universal SSL active
- [x] preserve existing production Worker, D1 and catalogue/provider gates
- [x] user confirmed the fixed hostname works after DNS cache refresh

Next: return to the waiting-on-IGDB sequence and review the legal partnership agreement when received.


### Public acquisition / launch hardening — 11 October 2026

Validated and ready for production deployment:
- [x] add non-deploying CI workflow for normal pushes / pull requests
- [x] make Cloudflare public build exclude internal-only `design-preview.html`
- [x] make Cloudflare public build exclude internal-only `pricing-coverage.html`
- [x] add canonical URLs for public pages
- [x] add page-specific GrailRaven titles and meta descriptions at build time
- [x] add Open Graph and Twitter summary metadata
- [x] add homepage WebSite structured data
- [x] add `robots.txt` with canonical sitemap location
- [x] add production `sitemap.xml` for indexable acquisition pages
- [x] mark Account / Saved Hunts / Privacy / Terms as `noindex,follow`
- [x] statically replace legacy public-brand text outside scripts/styles in the Cloudflare build while preserving internal compatibility identifiers
- [x] add public-build regression coverage
- [x] validation workflow passed: run `38155580640`
- [x] run the normal manual Cloudflare production deployment — run `38156024681`
- [x] verify live canonical/meta/robots/sitemap behavior after deployment
- [x] add automated post-deploy production smoke checks so future deployments verify the live custom domain automatically
- [x] correct SEO canonical paths to Cloudflare's extensionless production URLs after smoke test exposed 307 normalization
- [x] corrected production deploy + live smoke passed — run `38156550993`

Purpose:
- improve organic acquisition/readiness
- present a cleaner public surface to users and potential partners
- keep internal labs out of the Cloudflare production site
- add automatic regression/build validation without auto-deploying changes


### Browser/security header hardening — 11 October 2026

- [x] audit current Cloudflare static/Worker response headers
- [x] add native Workers Static Assets `_headers` generation
- [x] add `X-Content-Type-Options: nosniff`
- [x] add `X-Frame-Options: DENY`
- [x] add conservative Referrer-Policy
- [x] disable unused browser capabilities with Permissions-Policy
- [x] add HSTS without preload
- [x] add restrictive CSP to JSON/API responses
- [x] add `X-Robots-Tag: noindex, nofollow` for workers.dev asset host
- [x] preserve Listing Checker photo OCR by deliberately not applying a site-wide static CSP while Tesseract loads from jsDelivr
- [x] extend regression and production smoke contracts
- [x] validation run `38156899006` passed
- [x] deploy security-header bundle and verify live headers — run `38159086437`

Public-product audit finding:
- the Listing Checker still exposes the intentional September 2026 RetroTechCollector automatic-pricing connector
- this predates the current PriceCharting-led provider strategy
- do not remove silently; decide whether to retain, hide, or retire it before the next public-product cleanup


### Public credibility + provider cleanup — 11 October 2026

- [x] retire the old public RetroTechCollector developer-key pricing connector
- [x] preserve manual Pricing v1 reference entry/storage/export
- [x] preserve Listing Checker photo OCR / Tesseract dependency
- [x] remove RTC provider/result fields and auto-fetch hooks
- [x] replace stale public RetroNomad branding in source-visible content with GrailRaven
- [x] replace "DESIGN PREVIEW" with truthful "EXAMPLE RESULTS" wording
- [x] remove stale "early-stage prototype", "development-site", "future backend" and Phase 1 beta wording
- [x] keep explicit disclosures that live marketplace discovery, automatic provider-backed pricing and background notifications are not enabled
- [x] refresh Terms wording/date without weakening user-verification disclaimers
- [x] add regression guards that RTC cannot accidentally reappear publicly and manual pricing/OCR remain intact
- [x] full validation run `38158956959` passed
- [x] deploy bundled credibility/provider cleanup + security headers — run `38159086437`
- [x] verify live smoke check passes after deployment — attempt 1


### Google Search Console setup — completed 11 October 2026

- [x] verify Domain property for `grailraven.com`
- [x] keep DNS verification record in Cloudflare
- [x] submit `https://grailraven.com/sitemap.xml`
- [x] sitemap accepted successfully
- [x] homepage indexed
- [x] `/analyze` indexed
- [x] `/about` indexed
- [x] live URL test confirms `/search` is available to Google
- [x] live URL test confirms `/catalogue` is available to Google
- [x] request indexing for `/search`
- [x] request indexing for `/catalogue`
- [ ] revisit Search Console after Google has had time to crawl/index and collect query data


### First collector SEO/acquisition page — validated 11 October 2026

- [x] create an evidence-led UK/PAL physical-game identification guide
- [x] target exact-copy acquisition intent rather than generic retro-gaming content
- [x] explain UK-exact vs shared-PAL vs visual-evidence-required identification
- [x] include launch-set examples backed by existing PALScout evidence
- [x] link readers into Search, Catalogue and Listing Checker
- [x] add Article + FAQ structured data
- [x] add indexed canonical production route `/uk-pal-game-guide`
- [x] add guide to sitemap
- [x] add Guide link across public navigation and homepage discovery
- [x] add regression/build/smoke coverage
- [x] validation run `38161759309` passed 61/61 tests
- [x] deploy first acquisition guide — run `38162267076`
- [x] confirm live production smoke passes — attempt 1
- [x] request indexing for `https://grailraven.com/uk-pal-game-guide` in Search Console after deployment
- [ ] later measure impressions/clicks/query terms before deciding the next guide cluster


### PriceCharting contact timing — decision 11 October 2026

- [x] do not contact PriceCharting now solely because RetroNomad was renamed GrailRaven
- [x] treat prior rename-confirmation note as a conservative internal safeguard, not a documented immediate provider requirement
- [x] keep PriceCharting inactive while IGDB agreement and eBay manual-review/forum route are still pending
- [ ] revisit whether a brief rename confirmation is prudent only immediately before Legendary subscription / real production API use


### New-visitor journey audit — validated 11 October 2026

Audit path:
Homepage / Guide -> Search or Listing Checker -> exact game selection -> Saved Hunt -> Account.

Findings fixed:
- [x] Catalogue hero heading used the body sans-serif instead of the shared Cinzel/serif display family
- [x] Catalogue hero copy tightened from broad "collection universe" wording to "Browse the GrailRaven catalogue."
- [x] Search no longer exposes internal "UI v2 preview" wording
- [x] Search hero copy now describes the current exact-target capability without prototype wording
- [x] Account fallback no longer claims production is on static GitHub Pages or that the backend is undeployed
- [x] Saved Hunts fallback no longer claims the account backend is undeployed
- [x] preserve Homepage -> Search / Listing Checker entry points
- [x] preserve Catalogue -> exact Search / Save Hunt handoff
- [x] preserve Search -> visible Save Hunt action after canonical game identification
- [x] preserve Saved Hunts -> Account path
- [x] add regression coverage for the audited journey and stale-copy regressions
- [x] validation run `38163291294` passed 62/62 tests
- [x] deploy user-journey audit patch — run `38163942682`
- [ ] visually confirm Catalogue heading typography on production


### Visible literal-newline rendering bug — fixed in source 11 October 2026

After deployment run `38163408484`, the user spotted visible `\n\n...` text at the top-left of every public page.

Root cause:
- the Cloudflare build's SEO metadata injection used the JavaScript string `"\\n"`, which writes the two visible characters backslash+n into the generated HTML
- non-whitespace text inside `<head>` caused the browser parser to surface those characters visually before the site shell

Fix:
- [x] replace literal `\\n` output with real newline characters in all three SEO/head insertion paths
- [x] add public-build regression asserting no production page head contains literal `\\n`
- [x] add live production-smoke assertion for the same regression
- [x] validation run `38163755549` passed 62/62 tests
- [x] redeploy fixed build — run `38163942682`
- [x] visually confirm stray top-left text is gone — user confirmed 11 Oct 2026


### Search -> Saved Hunts -> Account journey audit — validated 11 October 2026

Audit findings and fixes:
- [x] Saved Hunt now rebuilds from the user's current visible Search filters at save time instead of potentially using a stale in-memory target
- [x] an existing Saved Hunt opened from Saved Hunts now updates in place instead of creating a duplicate when criteria change
- [x] restoring an existing Saved Hunt now restores visible region/release/completeness/condition/price/English controls before editing
- [x] new hunts remain new-hunt saves; edit mode is tied to an existing hunt opened for editing
- [x] Save button gives direct Saved/Updated confirmation
- [x] Search reports when local save succeeds but account sync does not
- [x] unsupported NTSC-U / NTSC-J filters are visibly disabled and marked Planned
- [x] unsupported Limited edition / Collector's edition exact filters are visibly disabled and marked Planned
- [x] alert checkbox now records a future alert preference without implying alerts are live
- [x] signed-in Saved Hunt mutations attempt immediate cloud sync
- [x] Saved Hunts rerenders after cloud merge
- [x] Saved Hunts export filename uses GrailRaven public branding
- [x] Account automatically syncs Saved Hunts after authenticated sign-in
- [x] Account copy explains automatic sync and keeps manual Sync as retry/control
- [x] regression coverage added for the full retention journey
- [x] validation run `38166618478` passed 65/65 tests
- [x] deploy retention-journey audit patch — run `38166781719`
- [x] verify production smoke — passed attempt 1 in run `38166781719`
- [x] manually verify Account sign-in -> automatic Saved Hunt sync — live end-to-end pass 11 Oct 2026


### Manual retention-path verification — reopen state finding 11 October 2026

User manually created a Silent Hill PS1 hunt with:
- UK PAL
- Original release
- Box + disc
- No major damage
- English packaging only
- £73 maximum delivered

Verified on live Saved Hunts:
- [x] all selected criteria were preserved in stored hunt state
- [x] reopened Search restored all visible criteria correctly
- [x] unsupported planned filters remained disabled
- [x] stale-filter save bug is fixed in live production

Additional UX findings fixed in source:
- [x] Saved Hunts display labels now match Search wording (`UK PAL`, `Box + disc`)
- [x] reopening a canonical Saved Hunt now renders the canonical "Game identified" edit state rather than leaving example result cards visible
- [x] reopened canonical hunt presents a clear `Update Saved Hunt` action
- [x] regression test added
- [x] validation run `38168093423` passed 66/66 tests
- [x] deploy reopen-state/label cleanup — run `38168228445`
- [x] manually verify update-in-place behavior after deploy — Silent Hill hunt updated £73 -> £68 with Saved Hunts count remaining 1


### Listing Checker trust/usability audit — validated 11 October 2026

Audit path:
Listing details / URL / gallery -> PALScout classification -> evidence panel -> optional price comparison.

Findings fixed:
- [x] title recognition alone can no longer become release-level Comparison-ready
- [x] final safety gate forces REVIEW when no recognised release identifier/evidence record matched
- [x] scanned photo OCR can now serve as the starting evidence path without also requiring a typed title/identifier
- [x] English/UK checkbox now explicitly means visual confirmation from listing photos, not seller-description wording
- [x] explicit manually entered identifiers now appear in the Evidence used panel
- [x] bucket-specific manual pricing values are cleared when the exact comparison key changes, preventing reference bleed between games/releases
- [x] saved reference for the new exact bucket is loaded after a key change when available
- [x] future-dated manual pricing references are rejected at save time
- [x] remove public/internal "Pricing v1" wording in favour of "Optional price comparison" / "Price comparison"
- [x] remove remaining runtime RetroNomad copy and legacy pricing export filename
- [x] clarify eBay URL handling: link recognised, direct automatic page import requires authorised API access
- [x] collapse optional manual pricing-reference inputs by default so identification remains the primary first-use task
- [x] Listing Checker browser title aligned with public navigation naming
- [x] regression coverage added for the trust gates
- [x] validation run `38169089612` passed 67/67 tests
- [x] deploy Listing Checker audit patch — run `38169240742`
- [x] manually verify FFVII / Silent Hill / Rule of Rose example outcomes and manual pricing gate — live production pass 11 Oct 2026


### Listing Checker example-button bug — fixed 11 October 2026

Manual production verification found that the built-in FFVII / Silent Hill / Rule of Rose example buttons did nothing.

Root cause:
- the old handlers relied on legacy browser ID-to-global-variable behaviour such as `title.value`, `platform.value`, etc.
- this is not reliable across modern browsers/page contexts

Fix:
- [x] use explicit `document.querySelector(...)` lookups for all example fields
- [x] refresh auto-detection hints before analysis
- [x] run analysis after populating the example
- [x] regression test added
- [x] validation run `38169769133` passed 68/68 tests
- [ ] deploy example-button fix
- [ ] retry FFVII / Silent Hill / Rule of Rose live examples


### Listing Checker runtime failure — root cause fixed 11 October 2026

Live production testing showed both the built-in examples and the main Analyse listing button were inert.

Root cause:
- the Listing Checker still referenced photo/OCR state and helpers (`photoOcrText`, `aggregateGalleryEvidence`, `scanListingPhotos`, etc.)
- that block had been accidentally removed during earlier September work
- missing state caused `analyse()` to throw before rendering
- missing `scanListingPhotos` also aborted later startup listener registration, leaving example buttons unbound

Fix:
- [x] restore the last known-good photo/OCR runtime block from commit `959d37def83029ceeaddb3ccc923dcce9e9150af`
- [x] preserve current GrailRaven trust/pricing changes
- [x] add runtime initialization regression test using Node `vm` so missing top-level helper references fail CI
- [x] add production smoke assertions that the deployed Listing Checker contains critical runtime helpers
- [x] validation run `38173148176` passed 69/69 tests
- [x] deploy runtime restoration — run `38177384405`
- [x] re-test main Analyse listing button and FFVII / Silent Hill / Rule of Rose examples — all live paths passed


### Organic-sharing acquisition experiment — ready to deploy

Business goal: make useful Listing Checker results easier to share in collector communities without exposing raw seller/listing text.

Implemented:
- [x] add a production Listing Checker `Copy result summary` action
- [x] summary includes only rendered verdict fields: game, platform, classification, release signal, matched identifier, completeness, PALScout compatibility and evidence strength
- [x] summary links back to `https://grailraven.com/analyze`
- [x] deliberately exclude seller URL, marketplace item ID, pasted title/description, listing price and postage
- [x] clipboard API + fallback copy path
- [x] build-time injection keeps the main analyser source untouched
- [x] regression tests verify privacy-safe field selection and production-build inclusion
- [x] validation run `38179493562` passed 71/71 tests
- [x] deploy sharing experiment — run `38180110251`
- [x] manually verify copied summary on a live FFVII result — privacy-safe output passed


### Listing Checker share-control visibility fix — validated

Live screenshot showed the deployed classification result without the expected Copy result summary control.

Fix:
- [x] render the share control directly in `analyze.html` source instead of relying on runtime DOM creation
- [x] include `listing-share.js` directly from the Listing Checker source
- [x] bind the source-rendered button in `listing-share.js`
- [x] retain dynamic creation as a fallback
- [x] add regression coverage for visible markup + event binding
- [x] validation run `38180622109` passed 72/72 tests
- [x] deploy visibility fix — run `38180715495`; live button and clipboard output verified


### Share-summary wording polish — validated

Live clipboard output was useful and privacy-safe. Minor collector-facing cleanup:
- [x] change identifier suffix from `· serial` to `(serial)`
- [x] remove internal `· text` suffix from completeness
- [x] validation run `38180874849` passed 73/73 tests
- [x] deploy wording polish — run `38180978208`


### Organic-sharing experiment — complete

Final production state:
- live Copy result summary control verified
- privacy-safe copied payload verified
- collector-facing wording polished
- deployment run `38180978208` passed 73/73 tests
- production smoke passed on attempt 1
- Worker version `1a8b6135-86ed-4e37-ace2-a2c5ccd6747e`

Next business step: move from product-internal work to a measured external distribution test.


### Distribution timing decision — 12 October 2026

Do not actively promote GrailRaven to collector communities yet.

Reason:
- the live site now demonstrates trustworthy classification, Saved Hunts, accounts and sharing
- but the core commercial promise is still incomplete without broader approved catalogue data and authorised live marketplace/pricing data
- early promotion now risks measuring reactions to missing dependencies rather than the intended Search -> Filter -> Compare -> Alert product

Wait for a materially more useful product state, preferably including:
- approved IGDB partnership terms and catalogue promotion
- at least one validated authorised live marketplace/inventory source
- credible release-safe pricing/reference data
- a more complete live Search -> Filter -> Compare -> Alert loop

Passive search indexing/SEO can continue, but no deliberate community launch/promotion yet.


### IGDB interim commercial integration authorization — 12 October 2026

IGDB replied after the partnership details were submitted.

Confirmed in writing:
- [x] IGDB legal has been asked to prepare the partnership agreement for DocuSign
- [x] expected signature email window: approximately 2–3 weeks
- [x] GrailRaven may proceed in the meantime with the planned API/data integration so engineering is not delayed
- [x] IGDB Data Dumps have already been enabled for the existing ClientID
- [x] if no DocuSign email arrives within the stated window, follow up and IGDB will escalate internally

Engineering interpretation:
- IGDB is no longer a hard blocker for catalogue metadata integration
- retain a separate record that the final legal agreement is still pending signature
- keep artwork disabled until the agreement is reviewed, unless rights are separately confirmed earlier
- add visible IGDB.com attribution automatically when an IGDB-backed public catalogue is active
- existing 8,433-game metadata promotion pipeline can now move forward once the repository commercial-authorization gate is enabled

New Data Dump readiness:
- [x] add `scripts/igdb-data-dump-check.mjs`
- [x] add manual `Check IGDB Data Dumps` workflow
- [x] require games, release_dates, covers and alternative_names dump availability
- [x] validation run `38272734523` passed 73/73 tests
- [x] run the Data Dump access workflow — run `38273861123`; 80 endpoints available; required catalogue dumps present
- [x] set repository variable `IGDB_COMMERCIAL_APPROVED=true` to record the written interim commercial integration authorization
- [ ] promote the 8,433-game metadata catalogue with artwork still disabled
- [ ] review/sign DocuSign agreement when received
