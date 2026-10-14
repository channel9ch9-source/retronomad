# Next Chat Handoff

Last updated: 9 October 2026

This file exists so a new ChatGPT thread can resume GrailRaven work without reconstructing project history from chat memory.

## Authoritative durable sources

Read these first:
1. `PROJECT_STATE.md` — current technical/deployment/provider state
2. `ROADMAP.md` — completed milestones and next work
3. `PRODUCT_VISION.md` — what GrailRaven is supposed to be
4. `BUSINESS_DIRECTION.md` — why the business exists, monetisation direction, validation plan and financial-success criteria
5. `CATALOGUE_V1.md` — catalogue architecture and public catalogue state

The GitHub repository is the authoritative durable record.

## Current public product state

Public brand: **GrailRaven**

Primary domain:
- `https://grailraven.com` — canonical; user confirmed working on 9 October 2026
- `https://www.grailraven.com` — fixed on 9 October 2026; now resolves and permanently redirects to the apex domain

Current public catalogue:
- 100 launch games
- PS1 40 / PS2 40 / Dreamcast 20
- all 100 remain PALScout-deep
- full 8,433-game IGDB candidate remains unpublished pending agreement

Current production Worker version after self-service account deletion:
- `2b05a097-2561-4ceb-905a-61fbf8c70b25`

Latest production regression suite:
- 56/56 passed

Artwork:
- dormant artwork architecture is deployed
- `CATALOGUE_ARTWORK_ENABLED=false`
- current public artwork count: 0
- artwork URLs are omitted from the public compact index while the flag is off

## www hostname fix completed

Resolved on 9 October 2026.

Cloudflare configuration:
- added proxied A record: `www` → `192.0.2.1`
- added Single Redirect matching hostname `www.grailraven.com`
- dynamic target preserves path: `concat("https://grailraven.com", http.request.uri.path)`
- status: 301 Permanent Redirect
- preserve query string: enabled
- apex `grailraven.com` remains canonical
- existing Worker custom domain, D1 and catalogue/provider gates were not changed

The hostname initially still appeared unavailable because of cached DNS resolution. After waiting for propagation, flushing Windows DNS and clearing Firefox DNS cache, the user confirmed `www.grailraven.com` worked.

## Immediate next task

Return to the waiting-on-IGDB sequence:
- await the IGDB legal partnership agreement
- review it before enabling any IGDB commercial/public gates

## IGDB status

Partnership response was positive.

Confirmed by IGDB:
- commercial partnerships offered
- API remains free of charge
- local storage allowed/preferred
- retained data can remain after partnership termination
- Data Dumps enabled once partnered
- user-facing attribution to IGDB.com required

Requested partnership details were sent on 7 October 2026.

Still pending:
- legal agreement
- agreement review/signing
- final production approval

Do not:
- set `IGDB_COMMERCIAL_APPROVED=true`
- publish the 8,433-game IGDB candidate
- publish IGDB artwork

until the agreement is received, reviewed and confirmed.

When agreement arrives, inspect:
- licensed data scope
- local storage/cache
- retention
- attribution
- Data Dumps
- redistribution/public GitHub
- cover/artwork rights
- derivatives
- sublicensing
- marketplace/display use
- commercial status
- termination
- update obligations
- trademarks
- confidentiality
- governing law
- liability/indemnity

## Full catalogue candidate

Validated development-only IGDB candidate:
- 8,433 games
- PS1 3,710
- PS2 4,019
- Dreamcast 704
- 8,333 BASE_ONLY
- 100 PALSCOUT_DEEP
- seed enrichment 100/100
- unmapped 0
- held provider records 38
- suppressed same-title 16
- same-title review groups 33
- ambiguity notes 3
- ID collisions 0
- invalid years 0
- explicit mappings 9
- artwork 0

Search benchmark:
- 24/24 quality cases passed
- compact full index ~1.372 MiB
- median query ~57.58 ms
- p95 ~105.82 ms

## PriceCharting

Commercial/public-use approval exists for the documented launch use.

Important:
- historical approval was under RetroNomad; do not rewrite history as if GrailRaven was the original approved name
- notify/confirm rename before production use where appropriate
- public provider remains disabled
- no real token has been used
- no real coverage claim has been made

Pre-subscription benchmark harness is complete and safely validated:
- pricing fixture 100/100
- Marketplace fixture 100/100
- platform population 40/40/20
- token-leak guard exists
- real benchmark workflow exists behind hard gate

Do not buy Legendary until ready to run the real benchmark.

## eBay

Previous developer application was rejected after appeal.

A new legitimate reconsideration request was submitted through eBay's official **"My account registration was rejected"** support path on 11 October 2026 and was rejected almost immediately.

Reconsideration positioning used:
- live public product at grailraven.com
- business-domain contact email: contact@grailraven.com
- intended use: eBay Buy Browse API, initially eBay UK
- exact-copy collector search by platform / region / edition / completeness / price
- listings link users back to eBay
- Saved Hunts may later identify newly available matching listings
- no scraping or bypassing access controls
- no automated buying, selling, bidding or messaging
- willingness to complete required Sandbox and production-access review

eBay's response said the account did not meet internal eligibility/risk-control criteria, gave no specific reason, and said reapplication may be considered later.

Do not:
- evade the rejection
- scrape around access restrictions
- create misleading accounts
- immediately create/reapply through another account merely to bypass the decision
- spam applications

Next eBay action:
- leave eBay parked for now
- strengthen the public product, catalogue, authorised provider integrations and real-user evidence
- reconsider a transparent reapplication later from a materially stronger position

eBay remains a strategically valuable future integration.

## Accounts / privacy / security

Live:
- passwordless email sign-in
- secure server sessions
- Saved Hunt cloud sync
- deletion/tombstone sync
- per-email magic-link throttling
- client-level cross-address sign-in abuse protection using daily rotating pseudonymous SHA-256 buckets
- updated Privacy notice
- self-service account deletion

Self-service account deletion:
- authenticated session required
- typed `DELETE` confirmation required
- removes cloud Saved Hunts and owned monitor/match/notification data
- removes outstanding auth tokens
- removes all sessions
- removes user account row
- clears session cookie
- clears current browser Saved Hunts/tombstones/legacy target storage/device ID

Production auth sender:
- `GrailRaven <accounts@grailraven.com>`

Public contact:
- `contact@grailraven.com`

## Business purpose

Primary goal:
**Build GrailRaven into a financially meaningful, sustainable software business.**

Do not optimise for feature count or treat it mainly as a hobby/portfolio project.

Major work should improve at least one of:
1. acquisition
2. retention
3. willingness to pay
4. defensibility

Commercial wedge:
**exact-copy acquisition intelligence**

Core loop:
**Search → Filter → Compare → Alert**

Do not try to become another generic collection tracker.

Preferred monetisation direction:
- freemium
- provisional Collector tier around £3.99/month or £35–£40/year, subject to validation
- later Trader/Professional tier only if demand justifies it
- possible referral/API/dealer revenue where permitted
- advertising is not the primary model
- do not build a full in-house marketplace without strong evidence

Once the useful marketplace product is live:
- run a serious 3–6 month acquisition/retention/payment validation phase
- measure search usage, Saved Hunts, return rate, alert usefulness, marketplace clicks, conversion, acquisition cost and willingness to pay
- accelerate if retention/payment intent is strong
- reassess positioning/model if serious distribution produces weak results

## Mobile

Android/iOS is a future opportunity, not a current priority.

Potential high-value mobile use:
- push alerts
- barcode scanning
- photo exact-release checking
- share-to-GrailRaven from marketplace apps
- in-store/event wanted/owned checks
- price/release evaluation while holding a game

Do not divert into separate native app development before web product-market fit is demonstrated.

## User working preferences

- direct, concrete, sequential instructions
- low-clutter chat
- repo is authoritative
- durable engineering/legal/business decisions should be committed to repo
- cost-conscious / pre-revenue
- no cold-calling strategy
- do not ask for passwords/secrets
- no additional Cloudflare account
- inspect GitHub Actions directly for deployment state/logs
- preserve approved Search visual parity
- avoid hardcoding public brand into internals unnecessarily
- when asked "what next?", prefer the highest-value action tied to financial success

## Strategic sequence after the www issue

1. Fix `www.grailraven.com` → apex redirect.
2. Await/review IGDB agreement.
3. If acceptable, promote approved 8,433-game catalogue and permitted artwork.
4. Run real PriceCharting pricing + Marketplace benchmark when ready to pay.
5. Connect authorised marketplace inventory only if benchmark quality is adequate.
6. Complete useful Search → Filter → Compare → Alert loop.
7. Begin real collector acquisition / behavioural validation.
8. Reapply for eBay developer access from a materially stronger position.
9. Test paid subscription willingness to pay.
10. Consider PWA/native mobile only when usage evidence supports it.


## Parallel work while external approvals are pending — 11 October 2026

While awaiting IGDB agreement and possible eBay manual-review movement, public acquisition/build hardening was completed and validated.

Ready to deploy:
- automatic non-deploying CI on push/PR
- production exclusion of internal `design-preview.html` and `pricing-coverage.html`
- canonical URLs
- page-specific GrailRaven SEO descriptions/titles
- Open Graph/Twitter summary metadata
- homepage WebSite structured data
- robots.txt
- sitemap.xml
- noindex handling for account/Saved Hunts/legal utility pages
- static public-brand replacement at build time without changing legacy internal identifiers
- regression test for public build contract

Validation run `38155580640` passed.
Production deployment run `38156024681` also passed with 57/57 tests.
Worker version: `4771a6fb-676f-427b-8c2f-bc8a22f158cb`.
Cloudflare logs confirm the new production assets were uploaded. Add automated live-domain smoke verification to future deployments.


## Public acquisition hardening fully verified — 11 October 2026

The corrected deployment run `38156550993` succeeded and the new live-production smoke step passed on its first attempt.

Cloudflare's canonical static-asset routes are extensionless (for example `/search`, not `/search.html`); sitemap/canonical metadata and smoke assertions were corrected accordingly.

Current Worker version: `52c90563-d3bd-415a-ad2c-5d0dba23a7c7`.

This milestone is closed. Future deploys now verify the live custom domain automatically after deployment.


## Waiting-period hardening in progress — 11 October 2026

A security-header bundle is validated but not yet deployed. CI run `38156899006` passed.

Important compatibility note:
- Listing Checker photo OCR loads Tesseract.js from jsDelivr
- therefore do not add a restrictive site-wide static CSP without explicitly allowing/reworking that dependency
- API/JSON responses can use a restrictive CSP safely

Public audit finding:
- `analyze.html` still contains the intentional September RetroTechCollector automatic-pricing connector
- current provider strategy is PriceCharting-led
- decide whether RTC should be retained, hidden or retired before further Listing Checker cleanup


## Ready-to-deploy waiting-period bundle — 11 October 2026

Validated in run `38158956959`:
- security header hardening
- public RTC connector retirement
- manual Pricing v1 preserved
- Listing Checker OCR preserved
- public GrailRaven branding/copy cleanup
- stale prototype/design-preview wording removed without pretending unavailable marketplace/pricing/notification features are live
- new regression guards for retired RTC connector and public-copy state

The bundle has not yet been deployed at this point.
Use the normal manual Cloudflare deploy workflow; the deploy now includes a live-production smoke test.


## Waiting-period bundle deployed — 11 October 2026

Deployment run `38159086437` passed:
- 60/60 tests
- no pending D1 migrations
- 100-game publication guard intact
- live production smoke passed on attempt 1

Current Worker version: `790860c0-5b5b-4a20-a584-182700e76617`.

The public RTC connector is now retired; manual Pricing v1 and OCR remain. Security headers and refreshed GrailRaven copy are live.


## Search Console milestone — 11 October 2026

Google Search Console Domain property for `grailraven.com` is verified.

Sitemap:
- `https://grailraven.com/sitemap.xml` submitted successfully

Indexing state at setup:
- homepage: indexed
- `/analyze`: indexed
- `/about`: indexed
- `/search`: live test available to Google; indexing requested
- `/catalogue`: live test available to Google; indexing requested

Google confirmed `/search` and `/catalogue` were added to the priority crawl queue. Do not repeatedly resubmit.


## Resend domain status — confirmed 11 October 2026

User confirmed in the Resend dashboard that `grailraven.com` is **Verified**.

The production passwordless-account sender remains `GrailRaven <accounts@grailraven.com>`. Treat the production sending-domain verification task as complete.


## First acquisition content page — ready to deploy

Built and validated 11 October 2026:
- source: `uk-pal-game-guide.html`
- canonical production route: `https://grailraven.com/uk-pal-game-guide`
- topic: how to identify a UK/PAL retro game copy
- evidence-led examples come from the existing PALScout launch dataset
- linked from public navigation/homepage
- included in sitemap
- Article + FAQ JSON-LD included
- production smoke now checks the guide

Validation run `38161759309` passed 61/61 tests.

After deployment:
1. require normal production smoke to pass
2. use Search Console URL Inspection for `https://grailraven.com/uk-pal-game-guide`
3. if live test is available to Google, request indexing once
4. do not repeatedly resubmit


## First acquisition guide deployed — 11 October 2026

Deployment run `38162267076` passed:
- 61/61 tests
- 100-game guard intact
- no D1 migrations
- guide asset uploaded
- live production smoke passed on attempt 1

Current Worker version: `27af9073-ea88-4eeb-950f-78c0fa1d133b`.

Next: Search Console URL Inspection for `https://grailraven.com/uk-pal-game-guide`; if Google's live test says it is available, request indexing once.


## First acquisition guide indexing — complete

Google Search Console live test for `https://grailraven.com/uk-pal-game-guide` succeeded and an indexing request was submitted on 11 October 2026.

Do not repeatedly submit it. Wait for crawl/index/query data before deciding the next SEO content cluster.


## PriceCharting contact timing — do not contact yet

User prefers not to bother PriceCharting unnecessarily.

Decision on 11 October 2026:
- do not contact PriceCharting now solely about the RetroNomad -> GrailRaven rename
- PriceCharting remains inactive
- revisit whether a brief rename confirmation is prudent only immediately before purchasing Legendary / starting real API production use
- do not represent the old approval as if it originally named GrailRaven


## User-journey audit patch — ready to deploy

Validated 11 October 2026 in run `38163291294`:
- 62/62 tests passed
- 100-game public catalogue guard intact

Audit findings fixed:
- Catalogue header font mismatch (now shared Cinzel/serif display typography)
- clearer Catalogue hero title
- removed Search "UI v2 preview" / prototype-style wording
- removed stale account/Saved Hunts "backend not deployed" / GitHub Pages fallback wording
- added regression coverage for Homepage -> Search/Catalogue/Listing Checker -> Saved Hunt -> Account path

Next: deploy normal Cloudflare workflow and visually confirm Catalogue header typography.


## Immediate deployment required — literal newline bug fixed

User screenshot after deploy run `38163408484` showed visible `\n\n...` text in the top-left of all public pages.

Cause: `scripts/build-cloudflare.mjs` emitted literal `\\n` text while injecting SEO tags into `<head>`.

Fixed and regression-protected. Validation run `38163755549` passed 62/62 tests.

Next:
1. run normal Cloudflare deploy from current `main`
2. require live production smoke to pass
3. visually confirm the top-left `\n` text is gone
4. then verify Catalogue hero font fix live


## User-journey audit + newline rendering fix — deployed

Deployment run `38163942682` passed:
- 62/62 tests
- 100-game guard intact
- no D1 migrations
- live smoke passed on attempt 2
- Worker version `fcec6c95-2fea-45e9-8903-5d91ab3f087f`

User confirmed the visible top-left literal `\n` text is gone.

The deployment also contains:
- Catalogue hero font alignment
- clearer Catalogue hero copy
- Search production-facing copy cleanup
- current Account/Saved Hunts fallback wording
- regression coverage for the new-visitor journey


## Retention journey audit patch — ready to deploy

Validated run `38166618478`: 65/65 tests; 100-game guard intact.

Key fixes:
- Search saves current filter state, not stale selection-time state
- existing Saved Hunts update in place
- Saved Hunt filters round-trip visibly on reopen
- unsupported US/Japan and limited/collector exact filters are disabled + marked Planned
- save confirmation distinguishes local save and account-sync failure
- alert checkbox is clearly a future preference only
- signed-in Saved Hunt mutations auto-sync
- Saved Hunts rerenders after cloud merge
- export filename uses GrailRaven branding
- Account auto-syncs Saved Hunts immediately after authenticated sign-in

Next:
1. deploy current main through normal Cloudflare workflow
2. require production smoke to pass
3. manually test Search -> Save this hunt -> Saved Hunts -> Open in Search/edit -> Account sign-in/sync


## Retention journey audit deployed

Deployment run `38166781719` passed with 65/65 tests and production smoke on attempt 1.

Current Worker version: `73fc344a-a4e6-42bd-b0cb-5d334159470e`.

Remaining verification: manually test the live Search -> Save -> Saved Hunts -> reopen/edit -> Account/sync path.


## Manual Saved Hunt round-trip — passed; reopen UX patch ready

Live manual test confirmed a Silent Hill PS1 Saved Hunt correctly preserved/restored:
- UK PAL
- Original release
- Box + disc
- No major damage
- English packaging
- £73 delivered ceiling

Screenshot exposed one remaining UX issue: reopened hunts showed restored filters but still displayed demo result cards and only a small inline save/update link.

Source patch now:
- aligns Saved Hunts labels with Search wording
- renders canonical Game identified state on reopen
- exposes clear Update Saved Hunt action
- hides demo results for reopened canonical hunts

Validation run `38168093423` passed 66/66 tests.

Next: deploy current main, then manually change one criterion and confirm the original hunt updates in place rather than duplicating.


## Reopened Saved Hunt UX patch deployed

Deployment run `38168228445` passed with 66/66 tests and production smoke on attempt 1.

Worker version: `902cfe88-b3e4-4ad4-9eb7-73124460ad54`.

User visually confirmed:
- canonical Game identified state appears on reopen
- saved filters remain restored
- demo cards are hidden
- Update Saved Hunt is the primary action

Remaining manual check: change one criterion, click Update Saved Hunt, and confirm the existing hunt changes in place while Saved Hunts count remains 1.


## Saved Hunt update-in-place — verified live

User changed the live Silent Hill PS1 hunt from £73 to £68 and clicked Update Saved Hunt.

Result:
- Saved Hunts count stayed at 1
- original hunt updated correctly
- no duplicate was created

Search -> Save -> reopen -> edit -> Saved Hunts is now manually verified.

Remaining audit step: test Account passwordless sign-in and automatic Saved Hunt sync with the existing hunt.


## Retention journey — complete

User manually verified the full production path on 11 October 2026:

Search -> Save -> Saved Hunts -> reopen/edit -> update in place -> Account sign-in -> automatic sync.

The Silent Hill PS1 test hunt remained intact after sign-in/sync with the updated £68 ceiling.

Treat the Search/Saved Hunts/Account retention audit as complete unless later changes touch this path.


## Listing Checker audit patch — ready to deploy

Validated run `38169089612`: 67/67 tests; 100-game guard intact.

Key fixes:
- no release-level Comparison-ready state from title recognition alone
- photo-OCR-only path allowed after scanning
- English/UK manual confirmation explicitly means visual listing-photo evidence
- explicit identifiers shown in Evidence used
- manual pricing references cannot bleed across comparison keys
- future reference dates rejected at save
- public Pricing v1 / legacy RetroNomad wording cleaned up
- pricing export uses GrailRaven filename
- eBay URL limitations clarified
- optional manual pricing controls collapsed by default
- browser title aligned to Listing Checker

Next:
1. deploy current main
2. require production smoke to pass
3. manually exercise FFVII UK example, Silent Hill PAL example, Rule of Rose example
4. verify price comparison remains blocked for REVIEW/SEPARATE and only grades Comparison-ready evidence


## Listing Checker audit deployed

Deployment run `38169240742` passed:
- 67/67 tests
- 100-game guard intact
- no D1 migrations
- production smoke passed attempt 1
- Worker version `59ee7b37-353a-408f-a683-e10d62606ad2`

Next: manually test built-in examples FFVII UK, Silent Hill PAL, Rule of Rose, then verify the manual price comparison gate.


## Immediate Listing Checker example-button fix ready to deploy

Live testing found all three built-in example buttons were inert.

Cause: legacy implicit DOM globals in the click handlers.

Fixed with explicit querySelector-based handlers and a regression test.

Validation run `38169769133`: 68/68 tests passed.

Next:
1. deploy current main
2. retry FFVII UK first
3. then Silent Hill PAL and Rule of Rose


## Listing Checker inert-page root cause fixed

Live symptom:
- main Analyse listing button did nothing
- FFVII / Silent Hill / Rule of Rose example buttons did nothing

Actual cause:
- photo/OCR runtime helpers and state had been removed earlier while references remained
- `analyse()` failed on undefined photo state
- startup binding failed at undefined `scanListingPhotos`, so later example handlers were never registered

Fix:
- restored historical photo/OCR runtime block from `959d37def83029ceeaddb3ccc923dcce9e9150af`
- added VM-based runtime initialization test
- added production smoke checks for Listing Checker runtime helpers

Validation run `38173148176`: 69/69 tests passed.

Next:
1. deploy current main
2. verify production smoke
3. manually type Final Fantasy VII and click Analyse listing
4. if that works, retry FFVII UK example, then Silent Hill PAL and Rule of Rose


## Listing Checker runtime fix — deployed and primary action verified

Deployment run `38177384405` passed with 69/69 tests and production smoke on attempt 1.
Worker version: `3dfbbb9a-9cb2-4ad9-b6a0-2c6b133a12d7`.

Live verification:
- Analyse listing button works
- FFVII with SCES-00867 resolves to Final Fantasy VII / PS1 / UK exact
- STRONG evidence
- COMPARISON-READY
- no price grading without a reference

Remaining: verify Silent Hill PAL review behavior and Rule of Rose separate-market behavior.


## Listing Checker live audit complete

Manual production verification now covers:
- FFVII / SCES-00867: UK exact, STRONG evidence, COMPARISON-READY
- Silent Hill / SLES-01514: shared PAL, STRONG evidence, COMPARISON-READY only in shared-PAL bucket (no exact-UK claim)
- Rule of Rose / SLES-54218: separate market / no normal UK retail bucket, price comparison blocked
- primary Analyse listing action works independently of example shortcuts

Treat the Listing Checker journey audit as complete unless later changes touch this path.


## Organic-sharing experiment ready to deploy

Added `listing-share.js` plus Cloudflare build injection for a privacy-safe `Copy result summary` action on Listing Checker results.

The share text includes only:
- game/platform
- classification + verdict title
- release signal
- matched identifier
- completeness
- PALScout compatibility
- evidence strength
- `https://grailraven.com/analyze`

It intentionally excludes seller URL/item ID, raw listing title/description and prices.

Validation run `38179493562`: 71/71 tests passed.

Next: deploy current main and manually verify the copied summary.


## Listing Checker sharing deployed

Deployment run `38180110251` passed with 71/71 tests and production smoke on attempt 1.

Worker version: `3ecfd380-a5d4-45b0-b2b8-fdb83d59799c`.

Next: manually verify the live Copy result summary control and inspect its clipboard output for correct fields and privacy-safe exclusions.


## Share-control visibility fix ready to deploy

The first sharing deploy passed CI but the live screenshot did not show the button.

Fix:
- source-rendered Copy result summary button/status
- direct `listing-share.js` include
- helper binds existing button, dynamic insertion retained only as fallback
- regression test added

Validation run `38180622109`: 72/72 tests passed.

Next: deploy and retry on a live Listing Checker result.


## Listing Checker share experiment — live pass

Deployment run `38180715495` passed with 72/72 tests and production smoke attempt 1.
Worker version: `291bde21-8215-4af2-9178-0ff529bb22b7`.

User confirmed the Copy result summary button is visible and copied a correct FFVII result. Privacy exclusions passed: no raw listing URL/item ID/title/description/price/postage.

A final wording cleanup is ready but not deployed:
- identifier source shown as `(serial)`
- completeness no longer exposes `· text`

Validation run `38180874849`: 73/73 tests.


## Sharing experiment closed

Final wording deployment run `38180978208` passed with 73/73 tests and production smoke on attempt 1.
Worker version: `1a8b6135-86ed-4e37-ace2-a2c5ccd6747e`.

Treat Listing Checker sharing as complete. Next priority should be a measured external distribution/feedback experiment, not more internal polish.


## Current distribution decision

Do not actively promote GrailRaven to Reddit/forums/collector communities yet.

Wait until the product is materially more useful, ideally with:
- broader approved IGDB catalogue
- validated authorised live inventory source
- credible release-safe pricing/reference layer
- substantially complete Search -> Filter -> Compare -> Alert experience

Passive search indexing can continue. Avoid premature launch traffic while the core data dependencies remain unresolved.


## IGDB status changed — interim integration authorization received

On 12 October 2026 IGDB replied that:
- legal is preparing the partnership agreement for DocuSign
- signature instructions should arrive in ~2–3 weeks
- GrailRaven may proceed now with the planned API/data integration
- Data Dumps have already been enabled for the ClientID
- follow up if DocuSign has not arrived within the stated window

Do not continue treating IGDB metadata integration as blocked.

Current safe sequence:
1. run `Check IGDB Data Dumps`
2. set repo variable `IGDB_COMMERCIAL_APPROVED=true` to record the written authorization
3. run `Promote approved IGDB catalogue` with confirmation `PROMOTE_IGDB_CATALOGUE`
4. keep `CATALOGUE_ARTWORK_ENABLED=false`
5. verify full 8,433-game production catalogue, attribution and search performance
6. review/sign the DocuSign agreement when received

Conditional IGDB attribution is already implemented in the public build and appears only when IGDB-backed canonical records are active.

Validation run `38272734523`: 73/73 tests.


## IGDB promotion gate ready

Data Dump access check run `38273861123` passed:
- 80 endpoints available
- games, release_dates, covers and alternative_names all present

User has set repository variable `IGDB_COMMERCIAL_APPROVED=true`.

Next: run `Promote approved IGDB catalogue` with typed confirmation `PROMOTE_IGDB_CATALOGUE`. Keep artwork disabled and verify production after promotion.


## IGDB promotion retry ready

First promotion run `38275243763` failed safely.

Fresh candidate was healthy:
- 8,458 games
- PS1 3,724 / PS2 4,029 / Dreamcast 705
- 100/100 PALScout deep seeds preserved/mapped
- validation passed
- search benchmark 24/24
- 1.375 MiB compact index
- median 58.08 ms / p95 106.24 ms

Failure was an obsolete test asserting exactly 100 public games (`8458 !== 100`). No D1 activation, repo commit or production deploy occurred.

Fixes on main:
- expansion-safe catalogue invariant
- candidate-as-canonical preflight before remote writes

Validation run `38277115940`: 73/73 passed.

Next: rerun `Promote approved IGDB catalogue` with `PROMOTE_IGDB_CATALOGUE`.


## IGDB full catalogue is now live

Successful promotion run: `38300719987`.

Current canonical catalogue:
- 8,462 games
- PS1 3,727 / PS2 4,030 / Dreamcast 705
- 8,362 BASE_ONLY + 100 PALSCOUT_DEEP
- all 100 deep seeds preserved/mapped
- artwork 0 / disabled
- search benchmark 24/24
- index 1.376 MiB
- median 44.74 ms / p95 82.95 ms

Production:
- D1 dataset `cat-455202e6a4daca830a8b` active
- canonical promotion commit `fc958b5dd1e4b223d0bfc938040cdb2fa5068855`
- Worker version `5574060c-3d30-4413-9de3-c17a0f1c8a88`
- IGDB attribution included conditionally in production build
- DocuSign still pending; interim written integration authorization remains the basis for proceeding

Future promotion workflow now includes production smoke verification.
Post-promotion validation run `38301997631`: 73/73 tests with 8,462-game build.

Next: manually inspect live Catalogue/Search behavior with expanded data, then resume marketplace/pricing integration work rather than community promotion.


## Expanded catalogue live-check hardening — 12 October 2026

After the 8,462-record promotion, source inspection confirmed Catalogue and Search both load the public compact index. The completed promotion workflow predated the newly added post-deploy smoke stage, so do not treat its successful deployment as a browser-level visual pass.

Commit `534ea8b4714772fad628d5f4b71ac36c9908801f` strengthened `scripts/smoke-production.mjs` to assert:
- live `/catalogue`, `/search` and `/catalogue-index.js` are available
- both pages load the compact index and display IGDB metadata attribution
- the public index parses and holds at least 8,000 records
- exactly 100 PALSCOUT_DEEP records remain
- IDs are unique and all three target platforms exist
- no artwork payload is inadvertently public

Validation workflow run `38308267634` succeeded (including smoke-script syntax check). This was CI validation, **not** execution of the new live smoke script.

**Next human action:** open [Smoke test GrailRaven production](https://github.com/channel9ch9-source/retronomad/actions/workflows/smoke-production.yml), choose **Run workflow** on `main`, and confirm its live checks pass. Then visually inspect `https://grailraven.com/catalogue` and `https://grailraven.com/search` for broad search, platform filters, deep-vs-base coverage, canonical game selection and Saved Hunt handoff. Direct live-site access was unavailable to the assistant in this chat, so do not mark visual testing completed.

After verification, resume the authorised PriceCharting pricing + Marketplace-offer benchmark decision. Keep provider/artwork disabled, do not subscribe or activate new paid access without user approval, and do not begin premature community promotion.


## Expanded catalogue live production smoke — passed 12 October 2026

User manually dispatched `Smoke test GrailRaven production` on `main`. GitHub Actions run `38313317268` **completed successfully** (the `Verify live production domain` step passed). This validates the newly added live Catalogue/Search/index/attribution/artwork-gate assertions.

Next is **browser-level visual verification**: inspect `https://grailraven.com/catalogue` for correct 8,462-game stats, populated browse cards, platform filtering and title search; follow a canonical detail card through `Find this game` to Search, where coverage should be represented conservatively. Then return to the authorised PriceCharting real benchmark decision. The assistant's direct web retrieval cannot inspect the live rendered UI in this chat, so do not claim visual verification has passed.

Artwork and paid marketplace provider remain disabled; DocuSign pending.


## Live Catalogue browse confirmation — 12 October 2026

The user visually confirmed `https://grailraven.com/catalogue` displays the expected **8,462** total records and platform counts (**PS1 3,727 / PS2 4,030 / Dreamcast 705**), with populated, scrollable catalogue cards. Combined with the passing live production smoke run `38313317268`, the catalogue size/display milestone is complete.

**Next manual check:** open a game marked `Base catalogue` from the live Catalogue, click **Find this game**, and verify Search opens with the correct game/platform selection and honestly labels its coverage as `Catalogue metadata` (not PALScout evidence ready). Then test Save Hunt if needed. Do not treat this as verified until the user confirms.

After this, prioritise authorised PriceCharting pricing/Marketplace real-coverage validation; retain the subscription and public-provider gates, and do not prematurely promote the product to communities.


## Expanded Catalogue → Search handoff — visually passed 12 October 2026

User supplied a screenshot after clicking **Find this game** from a base-only Catalogue entry. The live Search page correctly identifies **2006 FIFA World Cup**, **PS2**, **2006**, with **Catalogue metadata** coverage and **Game identified** state. It clearly states **Live listings not connected yet**, offers **Save this hunt**, and does not present fabricated marketplace inventory or pretend PALScout-deep evidence exists. The canonical Catalogue → Search transition and conservative UI presentation are therefore verified live for one BASE_ONLY title.

Remaining optional end-to-end check: use **Save this hunt** and confirm the PS2 game appears in Saved Hunts with the canonical title and filters; avoid conflating the visible save button with a successful save. Then prioritise the authorised PriceCharting real pricing + offers benchmark decision, retaining the paid subscription, marketplace provider, and artwork gates until specifically approved.


## Expanded IGDB catalogue user journey complete — 12 October 2026

User confirmed that **2006 FIFA World Cup (PS2)**, a BASE_ONLY game selected via Catalogue → Find this game, was successfully saved and appears in **Saved Hunts**. Together with the prior user screenshot of its conservative Catalogue metadata identification, the 8,462-game live catalogue smoke check, and the confirmed platform totals/cards, this closes the representative expanded-catalogue → Search → Save journey. This does *not* establish that all 8,462 records have deep PALScout release evidence or that live marketplace monitoring is available.

**Next priority: PriceCharting real-world validation**. The paid-token benchmark scaffolding, fixtures, attribution paths and restricted workflow already exist. The next nonengineering decision is whether/when to purchase Legendary (documented approval: $50/month until $1k/month revenue) to test pricing AND Marketplace offers against the pinned 100 PALScout-deep launch targets. Do not subscribe, set token secrets, enable the live benchmark, or enable public provider access without the user's informed approval. Preserve the earlier decision to revisit brand-name confirmation right before actual API use, if prudent. No real PriceCharting coverage claims exist yet; eBay remains parked. DocuSign remains pending and artwork disabled.


## PriceCharting one-month experiment authorised in principle — 13 October 2026

The user agreed to try up to **one month** of PriceCharting Legendary for GrailRaven's real pricing and Marketplace-offer benchmarks, expressing that a continuing monthly expense would be difficult while the product has no revenue. This is consent to proceed with a capped one-month validation plan, **not** an instruction to subscribe automatically or authorisation for continuing recurring cost.

Pre-subscription review:
- PriceCharting's official Legendary page lists USD $49/month (confirm amount/taxes and monthly billing at checkout).
- Existing `tests/pricecharting-provider.test.mjs` tests both deterministic 100-target offline benchmark modes.
- GitHub Actions `Validate GrailRaven app` run `38314295596` passed, which runs the Node test suite.
- The real workflow `.github/workflows/pricecharting-real-benchmark.yml` remains hard-gated on `PRICECHARTING_REAL_BENCHMARK=true` and private `PRICECHARTING_TOKEN` GitHub secret; it does **not** activate the public inventory provider.
- Live PriceCharting coverage has **not** yet been measured.
- PriceCharting API/CSV results must be purged after the subscription ends; preserve only nonlicensed analysis/decision notes once that occurs.
- The historical written approval used the **RetroNomad** name; reassess whether a rename confirmation is prudent before actual public commercial display rather than claiming it was originally granted under GrailRaven.

**Next user action:** subscribe via PriceCharting's official site to **Legendary monthly**, only if final checkout is within the user's intended one-month spend. Do not choose an annual plan. Once confirmed, record the paid-through/renewal date and proactively arrange a cancellation reminder before renewal; do not ask the user to paste the token or payment information into chat. Next securely store the API token as a GitHub Actions secret, explicitly enable the real benchmark gate, and run `mode=both`. Review the real reports, check UK/PAL listing practicality, and cancel unless the user explicitly authorises renewal. Artwork stays off and public marketplace stays disabled during benchmarking.


## PriceCharting subscription purchased by user — 13 October 2026

User reports creating a PriceCharting account and purchasing **one month of its "premium" subscription**. **Exact tier has not yet been independently confirmed**; the required API-enabled tier is **Legendary**, not Collector. Do not assume API access or a benchmark token exists until tier is verified on the PriceCharting subscriptions page.

Next guided user action:
1. Open `https://www.pricecharting.com/subscriptions` while signed in; confirm subscription tier says **Legendary**, and note renewal date.
2. Click **API/Download** and verify that a private API token is available. **Never send token or screenshots showing token into chat.**
3. Once confirmed, privately store the token as GitHub Actions repository secret `PRICECHARTING_TOKEN`; set repository variable `PRICECHARTING_REAL_BENCHMARK=true` only before the real controlled run.
4. Run existing **Run PriceCharting real benchmark** workflow with `mode=both`. Download/analyse reports; preserve token privacy and do not activate public provider.
5. Schedule an early cancellation reminder based on confirmed renewal date; no further months authorised.

Subscription was purchased by user directly; assistant has no billing access. No real API integration test has been run yet. The existing RetroNomad-name commercial approval is documented, but avoid asserting it originally named GrailRaven.


## First real PriceCharting benchmark completed — 13 October 2026

GitHub Actions [run 38428624620](https://github.com/channel9ch9-source/retronomad/actions/runs/38428624620) passed both REAL (non-fixture) pricing and Marketplace modes using the private token. The raw report artifact was downloaded and audited; it is not committed to the public repo because it contains licensed PriceCharting data. Durable aggregate analysis: **`PRICECHARTING_REAL_BENCHMARK_2026-10-13.md`**.

Key metrics (100 PALScout-deep sample):
- pricing: 88/100 PAL title candidates with CIB values, but only **26** safe exact UPC/EAN matches; 62 title-only candidates, 9 strict title rejections, 3 identifier/title conflicts; 43 UPC lookup errors among 72 evidence-barcode targets
- Marketplace: **3 total available offers across 3/100 targets**, all PS1; PS2 0, Dreamcast 0; broad PAL-compatible MATCH 3, **UK-exact MATCH 0**; 0 benchmark provider-error rows
- shipping/UK-delivered price and exact UK suitability still unverified
- the offer result applies to the pinned 100 targets and existing title-safe matcher, not every listing on PriceCharting

Decision: PriceCharting is promising for PAL reference pricing but **does not currently justify a paid subscription as GrailRaven's primary live marketplace inventory source**. Keep public provider disabled. Do not claim 88 exact-release price matches; do not renew automatically. A narrowly scoped investigation into full-PAL marketplace inventory and strict title matching may clarify remaining uncertainty before cancellation. Preserve licensing terms: raw API/CSV reports must be purged when subscription ends. Obtain next billing date and plan a cancellation reminder. IGDB artwork and eBay remain separately gated.


## Low-cost PAL Marketplace breadth diagnostic prepared — 13 October 2026

After run `38428624620` returned only 3 offers across the pinned 100 games, a separate manual `Check PriceCharting PAL Marketplace depth` GitHub Actions workflow was added at `.github/workflows/pricecharting-marketplace-depth.yml`. It uses the **existing** hard gate and secret; no new credential needed. It performs just **three** authorised GET queries (`status=available` plus each of the known PAL console IDs G72/G63/G65), constrained by the normal provider throttle, and writes **aggregate counts only** (no individual offers/IDs/prices) to a temporary private Actions artifact.

Source: `scripts/pricecharting-marketplace-depth.mjs`. Regression: `tests/pricecharting-marketplace-depth.test.mjs`. This diagnostic checks whether the very low 100-game offer count is primarily limited by the sample/exact-title matching rather than the broader PAL market. It does **not** prove sellers ship to the UK; API pagination/truncation is not established. It does not deploy/enable the public provider.

**Next:** Verify CI on the latest commit `c965ff85a4bb42398eb8712439e6ccc4cd872426` passes. Ask the user to manually run **Check PriceCharting PAL Marketplace depth** on main only after CI passes. Inspect its small aggregate report and update the business verdict before renewing. Earlier code iteration on a newly written test briefly failed CI but was fixed before final workflow commit. Do not confuse with the prior successful full benchmark.


## Second PriceCharting real test — PAL-wide inventory insufficient (13 October 2026)

The user dispatched the new `Check PriceCharting PAL Marketplace depth` workflow. [Run 38440168377](https://github.com/channel9ch9-source/retronomad/actions/runs/38440168377) succeeded; artifact `pricecharting-pal-marketplace-depth` (id `11835355629`) was opened.

**Real returned available PAL offers across whole-console API queries:**
- PlayStation 1: **5** (5 unique products)
- PlayStation 2: **3** (3 unique products)
- Dreamcast: **0**
- **Total: 8 offers**.

This contrasts with **3 offers across the selected 100 launch games** in the earlier [run 38428624620](https://github.com/channel9ch9-source/retronomad/actions/runs/38428624620). The broad query reduces the probability that strict title matching alone explains the weak result. PriceCharting documents no pagination for `/api/offers`; avoid claiming a guaranteed exhaustive site-wide total. Its FAQ says the Marketplace supports USA/Canada for buyers and sellers (and separately contains international shipping text), so UK buyer suitability is also uncertain.

**Decision:** PriceCharting Marketplace does **not** justify ongoing paid use as GrailRaven's primary UK/PAL listing source. Pricing remains potentially useful but only 26/100 safe UPC matches were measured, compared with 88 title candidates. Both test outcomes are recorded without committing licensed raw provider values in `PRICECHARTING_REAL_BENCHMARK_2026-10-13.md`.

**Next:** Ask user for actual PriceCharting Legendary next billing/renewal date and offer a one-time reminder before renewal. Review subscription cancellation effective date to prevent unwanted recurring billing, but don't assume they have cancelled. Keep provider and artwork disabled. Pursue authorised UK-targeted live inventory alternatives and/or useful user-supplied listing URL workflows without circumventing eBay's denial. Keep IGDB agreement DocuSign review pending.


## International business scope and PriceCharting refund decision — 13 October 2026

User explicitly reminded that GrailRaven is envisioned as **an international collector website**; PALScout is its UK/EU intelligence feature, not the entire product. This was already explicit in `PRODUCT_VISION.md`: UK/PAL-first validation/launch, later NTSC-U/US, NTSC-J/Japan, more markets. Do not present PAL-only PriceCharting tests as proving its American/Japanese pricing or offer coverage.

Operational distinction: eBay Browse (when authorised) = live searchable listings, multiple markets; PriceCharting = sale-derived market price **references** (not equivalent to active seller inventory), with separate US/PAL/JP products; GrailRaven = exact-release classification. eBay developer access was rejected twice including reconsideration 11 Oct; must not bypass via new identities, scraping or unauthorised feeds. Public provider still off.

User asks whether to seek a PriceCharting Legendary refund. PriceCharting FAQ explains subscription cancellation; website TOS reviewed 13 Oct does not promise unconditional refunds, so any request is a **goodwill/discretionary** query, candidly disclosing that a small number of API validation calls were run. The user has already purchased one month and is pre-revenue/cost sensitive. Either (1) request refund promptly and **pause new paid API testing** until response, or (2) consciously use the paid period for a limited US/JP region-specific *pricing* coverage test, then cancel before renewal. Do not unilaterally choose or trigger another monthly charge. Confirm exact renewal date. Source detail in BUSINESS_DIRECTION.md.


## Small US/Japan PriceCharting benchmark ready — 13 October 2026

User opted to use the already-paid one-month Legendary period for a **small international benchmark**, rather than request an immediate refund. This is a test decision, **not** approval for another subscription month.

New files on main:
- `scripts/pricecharting-international-benchmark.mjs`
- `tests/pricecharting-international-benchmark.test.mjs`
- `.github/workflows/pricecharting-international-benchmark.yml` ("Check PriceCharting international coverage")

The script tests 24 **purposively chosen** PS1/PS2/Dreamcast game+console targets (4 per platform in each of US/JP) for PriceCharting *title+console* matches and presence of CIB/loose/new reference prices (no actual prices exported); and the **six** official US/JP console API namespaces for aggregated available Marketplace-offer counts. Console IDs verified against official PriceCharting API table: US PS1 `G6`, PS2 `G7`, Dreamcast `G16`; JP PS1 `G107`, PS2 `G108`, Dreamcast `G64`. No independent US/JP barcode map yet, so **NO exact physical release can be certified by this test**. Japanese names may diverge from published romanizations; title mismatches need follow-up rather than a sweeping coverage claim.

The benchmark never exports individual licensed prices, offers, seller details or API token; no public provider activation, and no new secret/variable required. It uses the existing `PRICECHARTING_TOKEN` GitHub Actions secret and `PRICECHARTING_REAL_BENCHMARK=true` hard gate, and is only manually triggered. GitHub CI **run 38445850571** succeeded on commit `a708c85d0ea15d68ab956d8ea4c70fcd2a449846`.

**Immediate next user action:** Go to https://github.com/channel9ch9-source/retronomad/actions/workflows/pricecharting-international-benchmark.yml , choose `main`, click `Run workflow`. Ask user to report green/red. Then fetch GitHub workflow artifact `pricecharting-us-jp-small-benchmark`, analyse US vs JP pricing and the six Marketplace category counts, and update roadmap and international provider decision. If this shows business-worthy reference pricing, still do not renew without the user's approval or claim edition accuracy. Confirm subscription next billing date before cancellation deadline; purge licensed raw reports when subscription ends.


## Real US/JP PriceCharting trial — results and next probe (13 October 2026)

Real benchmark [run 38446958623](https://github.com/channel9ch9-source/retronomad/actions/runs/38446958623) was green; private artifact id `11838860938` read successfully. **Durable aggregate analysis:** `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md`. All **24/24** purposively chosen games (US 12, JP 12) yielded game-title+correct-console candidates with CIB, loose and new/sealed price reference values; **0 exact physical releases independently verified** (no independent US/JP barcode map). 0 provider errors.

Marketplace console-category API responses: **US PS1 30, PS2 30, Dreamcast 30**; **JP PS1 3, PS2 10, Dreamcast 12**. These are returned offer counts (US 90, JP 25), **not trustworthy totals**: exactly 30 in all three US responses raises a strong potential result cap/window, and official PriceCharting `/api/offers` docs have sort options but no stated pagination. A PriceCharting support community reply mentions a 30-result site listing page, but not confirmed API limit. Need investigate before ruling in/out US as primary inventory source. The earlier 8 PAL console-wide offers remain valid as API returns, not a worldwide business verdict.

**Prepared manual six-request follow-up:** `Check PriceCharting US offer result window` workflow at `.github/workflows/pricecharting-us-sort-window.yml` on GitHub. Code `scripts/pricecharting-us-sort-window.mjs`, fixture tests `tests/pricecharting-us-sort-window.test.mjs`; compare `sort=lowest-price` versus `sort=starts` for three US consoles and report aggregate unique offer-ID overlap/counts ONLY (never individual IDs). Runs behind existing secret `PRICECHARTING_TOKEN` and variable `PRICECHARTING_REAL_BENCHMARK=true`, no new account/fee, no public integration. CI for workflow commit `1f8d08699139dcf6f5ae94df11d6aab15efa9738`: run `38447573716` green.

**Next user action:** dispatch [Check PriceCharting US offer result window](https://github.com/channel9ch9-source/retronomad/actions/workflows/pricecharting-us-sort-window.yml) on main; if green retrieve its private aggregate artifact `pricecharting-us-offer-result-window` and inspect whether distinct union >30. Then decide if larger US inventory merits further paid exploration, but do not renew Legendary without explicit approval. User has not yet supplied next billing date; prioritise obtaining it for cancellation reminder. Pricing-only business case remains uncertain because no exact release matching or paying users yet.


## US Marketplace sort-window test completed — 13 October 2026

The user manually ran **Check PriceCharting US offer result window** and [GitHub Actions run 38448105573](https://github.com/channel9ch9-source/retronomad/actions/runs/38448105573) succeeded. The aggregate-only artifact `pricecharting-us-offer-result-window` (id `11838772853`) was retrieved and inspected.

Compare official `sort=lowest-price` vs `sort=starts` for console-filtered available US inventory:
- US PS1: 30 in first result and 30 different in second, **60 distinct identified**
- US PS2: 30 in first and 30 different in second, **60 distinct identified**
- US Dreamcast: 30 in first and 3 new in second, **33 distinct identified**
- Across 3 consoles, **153 distinct available offers demonstrably returned** by the six queries.

This **PROVES individual 30-offer responses were nonexhaustive**; the earlier first-pass US '90' was not total marketplace size. Do **not** claim official documented API pagination or a 30-result hard limit, comprehensive accessible inventory, UK buyer eligibility, exact-release validity or international shipping. Full derived findings recorded in `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md` (no licensed raw provider rows committed).

Conclusion: PriceCharting's international pricing and US listings merit separate, realistic consideration, but **do not renew the $49/mo Legendary subscription automatically while pre-revenue**, particularly with no demonstrated exact-edition price match capability or paid demand. Keep PriceCharting public gate off. Future eBay Browse remains attractive with authorised access, but denied/rejected today; no scraping/circumvention. Rather than additional low-yield exploratory benchmarks, focus on how the provider would power a genuinely useful live Search → Filter → Compare → Alert product, and ask the user for actual next billing date so a cancellation reminder can be set before renewal. Parent GrailRaven is international; PALScout is UK/EU subset.


## PriceCharting US result-window diagnostic — 13 October 2026

User ran manual `Check PriceCharting US offer result window`. [Run 38448105573](https://github.com/channel9ch9-source/retronomad/actions/runs/38448105573) passed and artifact 11838772853 (aggregate report) was read. Two supported sorts `lowest-price` vs `starts` for each US console (PS1 G6, PS2 G7, Dreamcast G16) each returned 30 offers. Their unions: **PS1 60 distinct, PS2 60 distinct, Dreamcast 33 distinct**, **153 total across three US console namespaces**. For PS1/PS2 the windows do not overlap at all; Dreamcast overlap 27/30. This **proves prior '30 available US offers per console' was a response-window truncation**, not a full-inventory count. It does *not* establish exhaustive console totals or any URL for pagination; public docs list sort options, no page/offset.

Durable report updated at `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md`. Current fair assessment: US pricing title candidate availability looks promising, US Marketplace has **at least** 153 observed offers across three consoles, but usefulness for game-specific user searches/editions and UK/international buyer eligibility remains unvalidated. The PAL result (8 returned) and JP result (25 returned) are still correctly reported as **returned** counts, not exhaustive service inventory sizes. Full US marketplace breadth remains unknown.

**Next sensible direction:** stop treating console-wide count probes as business validation. If pursuing PriceCharting, test a small selection of user-relevant **product-ID-filtered** US offers plus independent exact-release validation and delivery/buyer eligibility rather than further sort-window enumeration. The existing `getOffers({productId,consoleId})` adapter already supports this. No public integration and no second paid month authorised. Obtain next PriceCharting billing date to set reminder and plan cancellation if no viable path.


## US game-specific Marketplace utility test ready — 13 October 2026

User confirmed the first PriceCharting Legendary month **began today, 13 October 2026**. Expect next renewal around **13 November 2026**, but actual billing/next charge must be verified in their PriceCharting account. User's consent extends only to this first month; no renewal authorised. Suggest a reminder around 10 November or earlier once exact date is verified. Subscription does not inherently end after the first month if it auto-renews.

Next high-value business test prepared on main: `Check PriceCharting US game-specific offers` at `.github/workflows/pricecharting-us-game-hunts.yml`, using `scripts/pricecharting-us-game-hunts.mjs` and offline `tests/pricecharting-us-game-hunts.test.mjs`. CI run **38449379097 passed** on commit `2987c7700f8ea9e6190f50c9c811e0b471458adf`.

This is a controlled, token-safe live investigation: **18 US game/platform targets, 6 per PS1/PS2/Dreamcast**, with four familiar and two collector-interest titles per platform. Fetch up to four exact-title, correct-US-console provider products per game, then request `/api/offers` filtered by **product ID and console** (the official supported query). Record only aggregated provider counts per game, offer-URL availability and conservative completeness wording counts. No raw offer IDs, prices, UPCs or seller details in logs/artifacts; exact US physical edition and shipping/buyer eligibility remain explicitly **unverified**. Workflow manually triggered, uses existing `PRICECHARTING_TOKEN` Actions secret and `PRICECHARTING_REAL_BENCHMARK=true` variable, does not enable public provider or commit licensed data.

**Immediate user action:** Open https://github.com/channel9ch9-source/retronomad/actions/workflows/pricecharting-us-game-hunts.yml, run workflow on `main`. Once green/red, inspect Actions run and `pricecharting-us-game-offer-benchmark` temporary aggregate artifact. If successful evaluate the actual *per-title* utility, not console-wide counts, before any public activation or spend decision. Avoid over-interpreting 18 purposively selected titles as population-wide coverage. Keep PriceCharting one-month limit and user control.


## PriceCharting US game-specific benchmark completed — 13 October 2026

User manually ran `Check PriceCharting US game-specific offers`, GitHub [run 38451003997](https://github.com/channel9ch9-source/retronomad/actions/runs/38451003997) **green**; private artifact `pricecharting-us-game-offer-benchmark` id `11839844500` (counts only) retrieved and read.

**Real 18 US game sample:** 18/18 title+US-console candidates, **13/18** games had available offers with links, **28 offers** total, **9/18** games with CIB-worded offer candidates, **0 API errors**. PS1 8 offers across 5 games, PS2 16 across 4 games, Dreamcast 4 across 4 games. Familiar targets 10/12 with offers; rare collector targets 3/6 with offers (Tomba!, Suikoden II, Illbleed); no offers on chosen variants for Rule of Rose, Haunting Ground, Cannon Spike, Silent Hill PS1 or Crazy Taxi Dreamcast. **All 28 unverified for exact physical edition and eligible delivery**, and up to four product variants per title only.

Update added to `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md` as durable aggregate business evidence. Do not confuse provider title candidates with exact release MATCH, CIB words with verified contents, or this convenience sample with population-wide market coverage. No production integration deployed. User's one-month trial began 13 October; expected renewal ~13 November, exact time/date still unconfirmed. No second payment authorised; reminder and cancellation decision remain essential.

**Next:** assess a small handful of *real* product-specific offers privately for correctness of physical region, variant/edition, completeness and seller/shipping eligibility (perhaps via limited privacy-safe audit; user may manually inspect provider offer pages). Then decide whether to build a tightly gated US product pilot or cancel to avoid recurring expense. Avoid endless API volume-only tests; the global goal remains Search → Filter → Compare → Alert with PALScout as regional module.


## PriceCharting Tomba! API field-presence audit ready — 13 October 2026

The user has supplied website screenshots of one US PS1 Tomba! Marketplace offer: front and back jewel-case art, disc with NTSC U/C and SCUS-94236, and an inside-case photo where a booklet/paper insert carries a Jersey Devil advertisement. Case and disc product codes match; original US black-label release highly supported; true original multi-page manual, disc playing surface, buyer shipping, and API photo reach are not yet proven. Recorded in `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md`.

**Official PriceCharting documentation** confirms `/api/offers` potentially includes `image-url` (primary offer image), `has-pictures`, offer URL, condition/include wording, seller ID, asking price, product name/console and offer status. Separate GET `/api/offer-details?offer-id=...` is documented and may include `has-pictures`; its response for **sold** offers can contain sensitive **buyer address/PII**. Do not assume API includes all gallery photos, seller description, original booklet proof, or location-dependent shipping costs merely because browser UI shows them. Documented `shipping-premium` concerns **paid international shipping for sold items**, not an available-offer quote. Authenticated raw details should never be logged or retained.

New manual private workflow: [Audit PriceCharting Tomba offer API fields](https://github.com/channel9ch9-source/retronomad/actions/workflows/pricecharting-tomba-field-audit.yml), guarded by existing `PRICECHARTING_REAL_BENCHMARK=true` variable and `PRICECHARTING_TOKEN` Actions secret. Source: `scripts/pricecharting-tomba-field-audit.mjs`, tests `tests/pricecharting-tomba-field-audit.test.mjs`, provider method `getAvailableOfferDetails` in `backend/pricecharting-provider.js`. It searches Tomba! US PS1 product candidates, checks available offers, samples **one** offer, optionally queries detail, and writes ONLY fixed-schema booleans/aggregate field-presence flags, never IDs/URLs/images/prices/seller/buyer values. Handles missing/denied detail access without breaking and never calls detail for a sold/ended offer. It is not a production integration or proof the sampled offer is identical to user's screenshot.

**Validation green:** GitHub CI run `38456515654` on source commit `5bda87ed7cfcea48a21f0cab9381b13800450486` passed. **Next user action:** manually trigger workflow on main, report green/red. Fetch private aggregate-only workflow artifact `pricecharting-tomba-field-audit`. Explain whether only a main photo / has-pictures indicator or additional gallery/description/shipping evidence is actually exposed via API; do not overclaim exact edition. Continue one-month trial only, expect renewal around Nov 13, user must confirm exact and cancel if unjustified.


## Live PriceCharting Tomba! API field coverage measured — 13 October 2026

User ran [Tomba! API field audit #38457084910](https://github.com/channel9ch9-source/retronomad/actions/runs/38457084910), green. Private aggregate-only artifact `pricecharting-tomba-field-audit` id `11844171373` (expires Oct 27) was downloaded and inspected. Two US Tomba! PS1 product candidates; one available offer; `/api/offer-details` succeeded.

**What is really exposed:** `/api/offers` includes listing URL, primary `image-url`, **nonempty description**, `include-string` / `condition-string`, price. The details endpoint includes listing URL, main image, `has-pictures: true`, claimed completeness/condition, and price; no recognised extra photo URLs or gallery arrays, seller feedback/identity, description fields on details endpoint, buyer-specific shipping charge or shipping eligibility. Do not infer all website gallery pictures are machine-visible. Audit did not verify same listing as the manual browser screenshot nor any exact US edition via API. Overall match for strict original US CIB remains REVIEW unless independent physical release proof is supplied. The temporary artifact stores only fixed-schema booleans and counts, **no licensed offer values or PII**. Full report notes in `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md`.

**Next high-value step:** Design a minimal **REVIEW-first, server-only** US listing pilot using available URL/main photo/description/condition/price, source attribution/linkback, human inspect-original handoff; do not falsely auto-confirm region/edition/CIB or invent UK delivered price. Before activating PriceCharting data for live GrailRaven public use, revisit the historic RetroNomad-name permission and potential US/JP market expansion approval with provider (only if needed; user avoids repetitive contact). Public provider is currently OFF. One-month Legendary purchased Oct 13; around Nov 13 renewal subject to account check; do not continue without informed user permission. Respect licensed data purge after subscription.


## PRIVATE PriceCharting REVIEW-first listing integration — built 13 October 2026

User explicitly authorised building/testing a limited REVIEW-first PriceCharting listing integration **privately**, with public provider still OFF. An automation reminder for PriceCharting renewal/cancel decision was created for **10 November 2026**, roughly three days before expected 13 November renewal (verify actual date in account).

Completed source and documentation:
- `backend/pricecharting-review-pilot.js`: standalone server-side **US** (G6 PS1, G7 PS2, G16 Dreamcast) game+console lookup, at most 4 product variants, available safe-link offers, existing PriceCharting normalization, source attribution, **REVIEW only**, explicit unresolved US physical-edition, manual/CIB, condition, buyer shipping status; USD item price but delivered GBP/postage/total null. Non-PAL region logic deliberately separated from PALScout.
- `tests/pricecharting-review-pilot.test.mjs`: fixture tests for wrong title/console/ended offers, ID de-duplication, bad URLs, escaped seller HTML, provider data privacy, and no false MATCH.
- `scripts/pricecharting-review-preview.mjs`: `--fixture` emits private-review HTML+summary for **synthetic offer only**; `--live` runs actual token-backed Tomba! US search and emits **aggregate-only** summary, never listing data.
- `.github/workflows/pricecharting-review-pilot.yml`: manual Actions workflow `Validate private PriceCharting REVIEW pilot`; checks tests, emits synthetic browser sample, runs aggregate-only live pipeline behind `PRICECHARTING_REAL_BENCHMARK=true` and `PRICECHARTING_TOKEN`. Artifacts have 14-day retention; public GitHub repo prevents sharing real licensed listing prices/URLs in artifacts.
- `PRICECHARTING_REVIEW_PILOT_V1.md`: exact scope, data, security and commercial restrictions.

GitHub CI for workflow code commit `07ce0e73bb957ee0663fbafd45cac947780b25fe`: successful [run 38460372330](https://github.com/channel9ch9-source/retronomad/actions/runs/38460372330). This does **not** mean the manually triggered live pilot ran yet.

**Next user action:** Open https://github.com/channel9ch9-source/retronomad/actions/workflows/pricecharting-review-pilot.yml and click **Run workflow** on `main`. Report green/red, then inspect and interpret synthetic HTML + real counts-only artifact. Do not tell user that public GrailRaven site shows PriceCharting listings; no production route/provider/secret has been enabled. If pilot passes, next engineering decision concerns a securely access-controlled preview (separate from public site) vs provider permission confirmation. Need confirm PriceCharting's previous RetroNomad-name approval covers public GrailRaven US use before actually displaying real licensed listings to website visitors. User bought **one month only**; another month NOT authorised.


## First private REVIEW pilot manual workflow green — 14 October 2026

The user ran [Validate private PriceCharting REVIEW pilot, run 38573133929](https://github.com/channel9ch9-source/retronomad/actions/runs/38573133929). It **passed all steps**: tests, synthetic HTML fixture creation/verification, real paid-token PriceCharting US candidate lookup and fixture/live aggregate artifacts.

Both artifacts were fetched and inspected:
- Synthetic-only `pricecharting-review-fixture-html`, id `11898074184`, expiry 28 Oct: 1 synthetic candidate, REVIEW 1, MATCH 0, explicit fixture wording, PriceCharting source/URL and USD item-price-only display.
- **Real** `pricecharting-review-live-aggregate`, id `11897849236`, expiry 28 Oct: Tomba! PS1 US, **2** product variants, **1** available listing, REVIEW **1**, MATCH **0**, 1 safe offer URL, 1 main thumbnail, 1 seller completeness wording, 1 condition wording, 0 buyer-specific shipping, 0 exact-edition independently verified.

Audit recorded in `PRICECHARTING_REVIEW_PILOT_V1.md`. Real licensed listing details were **never published to GitHub**, no Cloudflare production secret or public site route exists, and the browser demo HTML is synthetic only. Do not imply public integration is live. 

**Next:** Decide whether to seek a single provider written confirmation of RetroNomad → GrailRaven rebrand and US/JP global data/use licence before any public API price/Marketplace display. Only after licensing and economics are addressed should a secure access-controlled private preview or carefully guarded production pilot be considered. Date reminder Nov 10 exists; expected next $49 charge around Nov 13 (verify subscription billing). User wants practical progress, minimal unnecessary provider contact, no extra recurring expense.


## Public US PriceCharting Marketplace integration prepared — 14 October 2026

Owner explicitly requested to proceed with real PriceCharting data **publicly on GrailRaven**, and instructed not to bother PriceCharting about rebranding. Do not ask for name confirmation again. Attribution, paid-subscription terms and strict release confidence remain in force. **Do not claim launch until manual production deployment succeeds.**

Implementation now committed to main:
- `backend/pricecharting-public.js`: same-origin guarded `GET /api/marketplace/pricecharting/us?game=...&platform=...`; uses existing real US REVIEW-only adapter, item-only USD prices, thumbnails and provider linkback, whitelisted metadata only. Never exposes token, raw provider payloads, seller/buyer PII, assumed CIB, verified physical edition, shipping or GBP.
- `backend/alerts-worker.js`: route wired with separate `PRICECHARTING_PUBLIC_ENABLED`, health field `usMarketplaceEnabled`. Scheduled saved hunts and notifications remain disabled; US listings do **not** use PALScout UK classifier.
- `backend/migrations/0006_pricecharting_public_limits.sql`: distributed D1 30-second global reservation plus max 4 per hashed visitor/15min; 5-minute Cloudflare cached same-game results; expired hashed buckets deleted. No raw IP retention.
- `marketplace-us-public.js` + `search.html`: public enabled NTSC-U checkbox; real US result cards REVIEW-only with external offer and PriceCharting attribution links, USD asking prices only, seller-stated completeness/condition; clear errors/zero-results and honest limitations; preserved separate PAL search and US saved hunt target.
- `scripts/prepare-cloudflare.mjs`: independent public US enable flag true (opted in by owner), existing `MARKETPLACE_PROVIDER` and `NOTIFICATION_PROVIDER` disabled.
- `.github/workflows/deploy-cloudflare.yml`: requires existing Actions `PRICECHARTING_TOKEN` and sets Cloudflare Worker secret privately before deployment, in addition to existing Resend/etc. No automatic Worker deployment was added.
- `scripts/smoke-production.mjs`: validates public US flag, browser asset, enabled filter, and invalid-parameter 400 without paid API calls.
- `tests/pricecharting-public.test.mjs`: validates sanitization, review-only output, cache/rate limit, fail-closed, secret non-exposure; `tests/site-v2-contract.test.mjs` updated for newly supported US checkbox.
- Privacy disclosure updated. Full engineering/operations and kill switch in `PRICECHARTING_PUBLIC_V1.md`.

**NEXT REQUIRED USER STEP:** after verifying latest GitHub validations green on main, ask user to manually run [Deploy app to Cloudflare](https://github.com/channel9ch9-source/retronomad/actions/workflows/deploy-cloudflare.yml) and report green/red. Then independently verify deployment logs, `/health` `usMarketplaceEnabled:true`, live `/search` US filter, and one real PriceCharting offer using e.g. Tomba! US PS1 (could hit global cooldown or no inventory). No provider outreach is required by user. Existing single-month paid term started 13 Oct; 10 Nov cancellation reminder already exists, renewal expected 13 Nov pending billing date confirmation.


## PUBLIC PriceCharting US Marketplace successfully deployed — 14 October 2026

The owner manually triggered [Deploy app to Cloudflare run 38579823383](https://github.com/channel9ch9-source/retronomad/actions/runs/38579823383) on main commit `cd73b10e62a98fadd79dda45d943ba595e99a446`. **Deployment SUCCESS and all job stages green:** npm regression tests, Cloudflare static build, D1 preparation and migrations (including public pricecharting limits), private PriceCharting API token provision to Worker via `wrangler secret put`, Worker + static assets deploy and **live production smoke**.

Production smoke code confirms `/health` reports `usMarketplaceEnabled:true`, Search page enables `regionUs` checkbox and serves `marketplace-us-public.js`, and invalid US Marketplace API query gets HTTP 400 **without a paid API lookup**. The legacy Saved Hunt monitor provider and automatic notifications remain disabled. The real public US API/UI feature is deployed, but **a valid live offer lookup and rendered result card have NOT yet been independently verified**: assistant's direct web/container fetch from this environment was unavailable. Do not assert verified US offers were retrieved by public visitors until manual screenshot confirms.

**Next user action:** Open https://grailraven.com/search, enable NTSC-U (US marketplace), ensure PS1 platform, enter `Tomba!`, click Search and send screenshot of live result/status (do not buy). If no match in catalogue, try another title (e.g. Silent Hill or Resident Evil 2), but don't conflate catalogue mismatch and provider no-offer. Check for REVIEW card, USD item price, PriceCharting attribution, original offer link and shipping-unknown disclaimer, or diagnose 429/503/browser state. Respect 30-second global D1 request cooldown. No repeated emails to PriceCharting about branding; user explicitly opted for public rollout. No second Legendary month authorised; Nov 10 reminder.


## Tomba! / Tombi! cross-region 0-result bug fixed in source — 14 October 2026

User tested newly deployed public US PriceCharting search at https://grailraven.com/search and sent screenshot: typed **Tomba**, selected US + PS1, but catalogue resolved to **Tombi!**, and site displayed **0 US Marketplace offers** with a 200/empty response and successful "Real US offers" status. Root cause isolated in `search.html` `buildTarget()`: canonical (PAL/IGDB) title `Tombi!` was forwarded verbatim to the US PriceCharting adapter, whose product filter strictly matches `Tomba!`. This is a search **name mapping error**, not evidence that the provider has no current stock.

Fix now committed, **not yet redeployed to live Cloudflare**:
- `backend/pricecharting-review-pilot.js`: exported `usMarketplaceGameTitle` resolves PS1 `Tombi!` / `Tombi` to US `Tomba!` prior to /api/products search and exact title filtering; unrelated regions/platforms untouched. Preserve REVIEW-only, attribution and security.
- `marketplace-us-public.js`: `displayTitle` maps same title for US UI and API query.
- `search.html`: US `buildTarget()` translates regional name while retaining original canonical `catalogueId`; US selection header displays Tomba! and `US Marketplace · REVIEW only` rather than misleading UK PALScout coverage; avoids PAL cover evidence.
- Regression tests updated in `tests/pricecharting-review-pilot.test.mjs` and added `tests/marketplace-regional-title.test.mjs` to check provider search query `Tomba! Playstation`, REVIEW result, client US name, catalogue identity and UI wiring.

**CI green on fix commit `a62014a1f17d9b092547cb124802b211295ffc75`**: [Validate GrailRaven app run 38583899146](https://github.com/channel9ch9-source/retronomad/actions/runs/38583899146). **Next user step:** manually [Deploy app to Cloudflare](https://github.com/channel9ch9-source/retronomad/actions/workflows/deploy-cloudflare.yml) on main; then revisit Search US PS1 Tomba! and send screenshot. Await actual browser offer confirmation; provider inventory can change. No further PriceCharting provider email needed. Expected next subscription charge ~13 Nov, 10 Nov reminder retained.


## First REAL public US Marketplace offer visible in browser — 14 October 2026

Following the Tombi!→Tomba! naming fix, user ran [Cloudflare deploy #38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) successfully and supplied actual grailraven.com Search screenshot. **Full public integration verified end-to-end**: US PS1 Tomba, correct `TOMBA!` title, **1 real PriceCharting offer** with seller front-case photo, seller CIB claim, normal-wear condition, **USD 134.00** shown, original seller offer link, PriceCharting credit, and properly marked REVIEW. Important distinction: **one result is not a hardcoded result limit**; earlier authenticated API benchmark also found 1 for Tomba. Backend checks at most two matching provider product variants; public returns max twelve filtered candidates and still does not prove complete inventory. UK/JP and alerts not activated.

Immediate UX QA issue to address in next batch: PriceCharting website seller screenshot showed same $134 **including $5 shipping** to page destination, while GrailRaven public UI declares **item only** and **shipping excluded**. API monetary field semantics are unverified. Avoid treating $134 as guaranteed item-only. Change wording to **Listed price (USD) · shipping to your destination unverified**, including public notice, and test before deploying change; do not overstate delivered total. This is a copy/data-precision issue, not failure of integration. Can next test previously positive games, e.g. *Suikoden II* (PS1) or *Illbleed* (Dreamcast), wait 30s between fresh provider lookups. 10 Nov renewal reminder remains in place. Do not ask vendor to reconfirm brand.


## Provider sourcing desk research — 14 October 2026

After first public PriceCharting US Tomba result and discovery of the narrow supply, user agreed to **inventory-provider feasibility first**, not UI/links/subscriptions. Research results are documented at [INVENTORY_PROVIDER_FEASIBILITY_2026-10-14.md](INVENTORY_PROVIDER_FEASIBILITY_2026-10-14.md) (commit `460c2e41bf0b117c306fe74d90ffce51e008edf2`).

Prioritise **Chillout Games / Retro-Games** (one UK company) for excellent item-level PAL/region/edition/CIB actual-photo evidence, and **eStarland** (US) for NTSC-U PlayStation, PS2 and Dreamcast preowned stock and an existing affiliate/business-development inquiry route. Neither provider has granted data-access/display rights or documented GrailRaven feed availability. Awin and Webgains can offer approved retailer product feeds but no verified original-retro seller feed; avoid unproductive generic gaming affiliates. Official URLs and specific in-stock examples in memo.

**NEXT USER DECISION:** authorise brief outreach to 2 high-fit retailers asking about read-only API/CSV/XML product feeds, real current item-level inventory, image display rights, update cadence, attribution, fees/commission. Do not send without explicit approval. Build no store-specific scraping or unauthorised importer. Benchmark 20 collector searches after legal access to sample feed, then decide whether to integrate. IGDB continues separately as metadata; eBay denied access, PriceCharting one month, reminder 10 Nov.


## Retailer outreach SENT — 14 October 2026

User personally confirmed sending both GrailRaven read-only inventory-feed partnership enquiries: **Chillout Games (UK)** and **eStarland (US)**. eStarland was routed through **Business development** because the Affiliate program inquiries link led to registration instead of a direct enquiry email. Status: **AWAITING RESPONSES, no data rights or integration approval yet**. Follow up politely after about 5–7 working days if silence. Do not ask the user to resend; do not implement scraping. Partner feasibility source: `INVENTORY_PROVIDER_FEASIBILITY_2026-10-14.md`. Next: evaluate replies against permission, format, refresh, available/variant fields, release/condition details, pricing/commission, then measure sample inventory. In meantime research backup authorised stock sources and benchmark design.


## ACTIONABLE NEXT STEP: RetroFix third authorised feed enquiry (14 October 2026)

Following user's "what's next" after personally sending Chillout Games + eStarland inquiries, performed additional source research and created **`INVENTORY_COVERAGE_BENCHMARK_V1.md`** with 20 fixed US/UK PS1/PS2/Dreamcast collector queries. Detailed candidate findings appended in `INVENTORY_PROVIDER_FEASIBILITY_2026-10-14.md`. **RetroFix (myretrofix.co.uk/partner/, info@myretrofix.co.uk)** is the best next retailer to contact, because its real product pages include distinct PAL & NTSC-U imports, CIB, wear and availability. Published partner programme is for store affiliates/referral links and **does not grant product feed, import or photo rights**. Owner has not contacted RetroFix yet; ask whether they would like to send a short, polite enquiry focused on GrailRaven's approved comparison-data feed access, without registering for wholesale or committing to fees.

Lukie Games (US physical stock) and Retro Console Store (5% affiliate referrals) are lower-confidence future leads; API/read-only feed status unknown. No integrations built, no new commitments. Benchmark and both previous outreaches logged. PriceCharting public US one result remains live, review-only; IGDB contract awaiting legal correspondence.


## RetroFix enquiry confirmed SENT — 14 October 2026

User confirmed that their email to **RetroFix / MyRetroFix** (`info@myretrofix.co.uk`) was sent. **All three initial inventory-feed enquiries are now sent**: Chillout Games, eStarland (business development), and RetroFix. All **await supplier replies**; do not ask user to send these again, do not assume approval or begin unauthorised scraping. Benchmark template `INVENTORY_COVERAGE_BENCHMARK_V1.md` is ready for a permitted feed; full research at `INVENTORY_PROVIDER_FEASIBILITY_2026-10-14.md`. Next practical direction while waiting: progress unrelated IGDB legal/data-integration steps without public data rights assumptions, or prepare internal benchmark importer schemas, but avoid making commitments or paying for feed access absent evidence. Evaluate any response for display rights, actual buyable items, condition/region variants, availability refresh, terms, and cost.
