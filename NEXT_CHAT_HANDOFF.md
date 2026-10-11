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
