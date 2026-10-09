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

Do not:
- evade the rejection
- scrape around access restrictions
- create misleading accounts
- spam applications

Future plan:
- reapply from a materially stronger position after the product is live and has stronger evidence
- show legitimate public product, privacy/account controls, exact-copy classification and real user activity where available
- explain that GrailRaven helps collectors identify relevant listings and sends users back to the marketplace

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
