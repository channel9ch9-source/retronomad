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
- [ ] Add visible PriceCharting attribution/linkback to pricing/result UI
- [ ] Adapt/build the 100-title PriceCharting pricing coverage harness
- [ ] Build a separate 100-title PriceCharting Marketplace offer-coverage harness
- [ ] Only when ready for real validation, purchase the approved Legendary subscription
- [ ] Store `PRICECHARTING_TOKEN` only as a Cloudflare Worker secret
- [ ] Run the 100-title UK/PAL pricing benchmark
- [ ] Run the 100-title Marketplace offer benchmark
- [ ] Audit exact identifier/product-ID matches, PAL safety, completeness mapping and UK usefulness
- [ ] Decide from measured results whether to wire PriceCharting into the public Deal Finder and scheduled Saved Hunt monitor
- [ ] Keep eBay independent; do not assume PriceCharting Marketplace replaces eBay without coverage evidence

Immediate engineering action after this handoff:
**Add the PriceCharting attribution/result presentation contract, then build the real-token benchmark harnesses while keeping the live Worker marketplace provider disabled.**

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
- [ ] Before public account launch, verify a RetroNomad-owned sending domain and add stronger abuse protection
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
**No authorised eBay developer access. Earlier developer application was rejected after appeal.**

Do not:
- evade the rejection
- scrape protected data as a substitute for authorised API use
- create misleading accounts
- spam applications

Future:
- [ ] maintain a functioning public RetroNomad prototype
- [ ] prepare a concise authorised Browse API use case
- [ ] reapply only when there is a materially stronger legitimate application
- [ ] use accurate identity/business/project information
- [ ] disclose prior rejection where appropriate
- [ ] if approved, integrate active listing discovery behind an authorised connector/backend

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
- [ ] verify a RetroNomad-owned sending domain
- [ ] add stronger abuse protection
- [ ] update privacy/account-data policy
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
- [ ] await IGDB commercial partnership response
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
- [x] gate future full-catalogue promotion on search benchmark
- [ ] run full 8,433-game search benchmark
- [ ] review any failed/ambiguous benchmark cases
- [ ] deploy autocomplete improvement to current 100-game public Search after benchmark passes
