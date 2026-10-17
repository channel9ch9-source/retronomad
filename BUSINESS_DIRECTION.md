# GrailRaven Business Direction

Last updated: 9 October 2026

This file is the durable business-purpose anchor for GrailRaven.

It complements `PRODUCT_VISION.md`, which defines what the product should do. This file defines **why the business exists, what outcome it is trying to create, how future work should be prioritised, and what evidence should determine whether to continue, accelerate or change direction.**

## Primary business objective

GrailRaven is being built as a serious attempt to create a **financially meaningful, sustainable software business**.

The project should not drift into feature-building for its own sake or become primarily a hobby/portfolio project.

The central decision question for major work is:

> **Does this materially improve GrailRaven's chance of becoming a financially successful business?**

Future product, engineering, data-provider and distribution decisions should be evaluated against that objective.

Financial success is not assumed or guaranteed. The project should seek evidence of demand, retention and willingness to pay rather than treating continued development as proof of product-market fit.

## Why this business direction was chosen

GrailRaven is intended to have several characteristics that make it suitable for a bootstrapped small software business:

- low starting capital relative to inventory-heavy or manufacturing businesses
- recurring-revenue potential
- software economics with low marginal cost per additional customer
- a defined enthusiast/collector market
- a problem that benefits from structured data, classification and marketplace access rather than generic AI output alone
- an opportunity to build specialised knowledge around exact physical game releases
- no dependence on cold-calling as the primary acquisition model

The project should preserve those advantages rather than expanding into operationally expensive areas without evidence.

## Product/business wedge

GrailRaven should **not** try to win by becoming another general collection tracker.

The intended wedge is:

> **Tell GrailRaven the exact physical copy you want. GrailRaven finds candidate listings, proves which ones match, rejects the wrong versions, compares them, and alerts you when the right copy appears.**

The core loop remains:

**Search → Filter → Compare → Alert**

PALScout is the key release-intelligence layer behind that promise.

The defensible behaviour is not merely recognising a game title. It is distinguishing the exact physical copy the collector actually wants across dimensions such as:

- platform
- region / market
- release / edition
- completeness
- language where relevant
- condition constraints
- delivered price
- uncertainty in the listing evidence

MATCH / REVIEW / FILTERED must remain a trust feature. GrailRaven should not increase apparent coverage by silently guessing.

## Success definition

The target is not necessarily to build a venture-scale company.

A successful outcome can be a durable niche software business with recurring revenue that is financially meaningful to its owner.

Illustrative subscription scale at approximately £4/month before fees, discounts, taxes and costs:

- 1,000 paying users ≈ £4,000 MRR
- 2,500 paying users ≈ £10,000 MRR
- 5,000 paying users ≈ £20,000 MRR

These are **illustrative business targets, not forecasts**.

The project should be judged by real customer behaviour once the core product is usable.

## Primary monetisation direction

Preferred model: **freemium subscription**.

Provisional structure:

### Free
Useful enough to acquire and retain collectors:
- catalogue browsing
- normal search
- listing checker
- a limited number of Saved Hunts
- potentially slower or limited alerts once real alert delivery exists

### Collector paid tier
Likely initial target: approximately **£3.99/month or £35–£40/year**, subject to validation.

Potential paid value:
- substantially more or unlimited Saved Hunts
- faster alerts
- exact-release filters
- delivered-price thresholds
- richer price intelligence/history where licensed
- multiple marketplace sources
- email/push notifications
- other high-value buying intelligence

The paid product should monetise **better buying/hunting intelligence**, not merely the ability to store titles in a collection database.

### Trader / professional tier — later
Only after consumer product-market fit:
- bulk hunts
- lot analysis
- exports
- higher-volume research
- dealer/trader intelligence

## Secondary monetisation possibilities

Consider only where permitted and where they do not compromise trust:

- marketplace affiliate/referral revenue
- retailer/dealer tools
- professional/API access
- clearly separated sponsored inventory

Advertising should not be the primary model if it harms trust or clutters the buying-intelligence experience.

Do not build a full GrailRaven marketplace without strong evidence. Payments, fraud, disputes, seller verification and shipping would materially increase complexity and operating risk.

## Business decision filter

Major features should improve at least one of:

1. **Acquisition** — helps more relevant collectors discover or try GrailRaven.
2. **Retention** — gives collectors a reason to return repeatedly.
3. **Willingness to pay** — creates enough recurring value to justify subscription.
4. **Defensibility** — makes GrailRaven meaningfully harder to replace with a generic database, marketplace search or commodity AI tool.

Features that do not materially support one of these should normally be deprioritised.

A useful secondary product rule is:

> **Does this make it easier to identify, find, evaluate or acquire the exact physical copy?**

If not, it probably waits.

## Competitive posture

GrailRaven should not attempt to match every feature offered by general collector apps.

Do not automatically chase:
- social feeds
- achievements
- forums
- friend systems
- decorative collection features
- broad backlog tracking
- other unrelated collector-app features

The strategy is to be unusually good at **exact-copy acquisition intelligence**.

Competition validates that collectors care about region, edition, pricing, alerts and marketplace discovery, but also means GrailRaven must differentiate through precision, evidence and trust rather than simply offering a catalogue.

## Distribution is a first-class business problem

Building the product is not sufficient.

Once the core marketplace-hunting loop is usable, development should stop being almost entirely inward-facing. GrailRaven must be put in front of real collectors and measured.

Potential distribution channels to test:
- collector-focused SEO/content
- YouTube/video demonstrations
- retro-gaming communities where promotion is permitted
- relevant Reddit/community participation without spam
- retro events / fairs
- partnerships with appropriate retailers or collector businesses
- organic sharing generated by useful listing analysis / hunt results

Distribution experiments should be measured rather than assumed.

## Validation period after useful launch

Once GrailRaven has:
- a sufficiently broad approved catalogue
- working exact-copy search/classification
- at least one authorised live marketplace source
- working Saved Hunts / alerts
- a credible pricing/reference layer

the next major phase is **market validation**, not endless private feature development.

A reasonable initial validation window is approximately **3–6 months of active user acquisition and measurement**.

Key questions:
- How many visitors actually search?
- How many resolve a canonical game?
- How many create a Saved Hunt?
- How many return?
- How often do alerts/searches lead to marketplace clicks or useful outcomes?
- Which features cause repeat usage?
- How many users show willingness to pay?
- What conversion occurs at proposed subscription pricing?
- What does acquisition cost?
- Which acquisition channels produce retained users rather than low-quality traffic?

If retention and willingness to pay are strong, accelerate investment.

If serious distribution effort produces weak retention and weak willingness to pay, do not continue adding features indefinitely. Reassess positioning, monetisation, target customer or product direction.

## Marketplace strategy

Authorised marketplace access remains strategically important.

### PriceCharting
Current approved route:
- commercial/public-use approval exists for the documented pricing and Marketplace-offer use
- real paid 100-title benchmarks remain the next validation gate
- do not activate publicly until the benchmark demonstrates useful/accurate coverage

### eBay
eBay access remains a high-value future objective.

Previous developer access was rejected after appeal. Do not evade that decision or scrape around it.

On 11 October 2026, a legitimate reconsideration request was submitted through eBay's official rejected-registration support route from a materially stronger position, including:
- functioning public product at grailraven.com
- business-domain contact email at contact@grailraven.com
- clear privacy/account controls
- demonstrated exact-copy classification
- a concise legitimate Buy Browse API use case
- explanation that GrailRaven helps collectors identify relevant listings and sends users back to eBay
- explicit commitment not to scrape or bypass access controls

The reconsideration was rejected almost immediately. eBay stated that the account did not meet internal eligibility/risk-control criteria, provided no specific reason, and said the user may consider reapplying later.

Current action: park eBay rather than repeatedly reapplying. Strengthen the public product, authorised provider integrations and real-user evidence first, then reconsider a transparent reapplication later.

eBay access could materially strengthen inventory coverage, exact-copy hunting and alert usefulness, but the business architecture must remain marketplace-independent.

## IGDB dependency

Current near-term dependency:
- awaiting the IGDB legal partnership agreement
- do not publish the 8,433-game provider-backed candidate or provider artwork until the agreement is reviewed and the applicable rights are confirmed

Once agreement terms are acceptable:
1. record exact contractual conditions
2. activate the approved catalogue promotion path
3. populate artwork only where rights allow
4. verify full-catalogue performance and presentation
5. continue toward live marketplace validation

## Mobile / native app direction

A mobile app is a **future opportunity, not a current priority**.

Mobile could eventually be especially valuable for:
- push notifications for exact-match listings
- barcode scanning in shops/events
- photographing a game and checking exact release
- sharing marketplace listings directly into GrailRaven
- checking owned/wanted status while shopping
- price/release evaluation while physically holding a game

Do not divert the project into separate native iOS/Android development before web product-market fit is demonstrated.

Potential sequence:
1. prove the web product
2. measure meaningful mobile usage
3. validate demand for scanning/push/share workflows
4. consider an installable PWA or code-reuse approach
5. build native iOS/Android only when the expected retention/revenue benefit justifies the complexity

## Near-term strategic sequence

Current intended order:

1. Await/review IGDB partnership agreement.
2. If acceptable, promote the approved 8,433-game catalogue candidate and enable permitted artwork under existing gates.
3. Run the real PriceCharting pricing and Marketplace-offer benchmark when ready to pay for the required subscription.
4. Connect the first marketplace source only if benchmark quality is adequate.
5. Complete the useful Search → Filter → Compare → Alert loop.
6. Begin active customer-acquisition and behavioural validation rather than continuing indefinite private development.
7. Reapply for eBay developer access once GrailRaven is materially stronger and can demonstrate a legitimate functioning use case.
8. Introduce paid subscription experiments when recurring value is strong enough to test willingness to pay.
9. Consider mobile app development only after web/mobile usage gives evidence that it will improve retention or revenue.

## Standing strategic principle

GrailRaven is an **asymmetric bootstrapped business bet**, not a guaranteed path to financial independence.

The goal is to build something capable of meaningful financial success while keeping capital risk controlled, then let market evidence determine whether to double down, refine the model or pivot.

Do not confuse:
- code shipped with customer value
- catalogue size with product-market fit
- feature count with defensibility
- traffic with retention
- user signups with willingness to pay

The project should ultimately earn the right to continued investment through real collector behaviour.


## First measured SEO acquisition experiment — 11 October 2026

The first organic-acquisition page is an evidence-led guide on identifying UK/PAL physical-game copies.

This deliberately follows the business filter:
- acquisition: targets collectors with an active exact-copy identification problem
- defensibility: demonstrates PALScout-style evidence handling rather than generic game-database content
- product bridge: links directly into Search, Catalogue and Listing Checker

Do not create a large volume of generic SEO articles by default. Let Search Console query/impression data and real product engagement inform the next content cluster.


## First organic-sharing product experiment — 11 October 2026

After the Search/Saved Hunts and Listing Checker journeys passed live verification, the next no-cost acquisition step is to make useful classification results easier to share organically.

The Listing Checker now has a privacy-conscious "Copy result summary" path for collector communities. It copies only the derived GrailRaven verdict fields and a link back to the checker; raw seller URL, marketplace item ID, pasted listing title/description and listing prices are intentionally excluded.

This experiment supports:
- acquisition through useful community sharing rather than promotional spam
- defensibility by surfacing PALScout exact-release reasoning
- trust by not embedding raw marketplace/user-entered listing content in the share payload

Do not add broad social-network integrations or tracking solely for this experiment. First verify that the basic share artifact is useful and understandable.


## Organic-sharing experiment — completed 11 October 2026

The Listing Checker sharing experiment is now live and manually verified.

Result:
- users can copy a concise derived GrailRaven verdict
- the payload excludes raw seller/listing URL, marketplace item ID, pasted listing title/description, item price and postage
- copied output includes a canonical link back to the Listing Checker
- final collector-facing wording passed live verification

This experiment is complete. The next growth priority should be external distribution/feedback rather than additional internal sharing polish.


## Distribution timing — defer active promotion until the core product is materially more usable

Decision confirmed 12 October 2026.

Do not begin deliberate community promotion merely because the current public site is functional.

The present product proves important foundations:
- exact-release classification
- Listing Checker
- Saved Hunts
- accounts/cloud sync
- privacy-safe result sharing

However, GrailRaven's main business promise is not the Listing Checker by itself. The intended value is Search -> Filter -> Compare -> Alert across real authorised marketplace inventory.

Active acquisition should therefore wait until the product has materially stronger real-world utility, preferably after:
1. IGDB partnership/legal terms are accepted and the broader approved catalogue can be promoted;
2. at least one authorised inventory/marketplace source has been validated and connected;
3. release-safe pricing/reference coverage is credible enough to support comparison;
4. the live search/hunt loop is substantially closer to the intended end product.

Passive organic indexing can continue while those dependencies are pending. Avoid manufacturing activity through premature Reddit/forum promotion just to create traffic.


## IGDB integration can now proceed before signature — 12 October 2026

IGDB explicitly authorised GrailRaven to proceed with the planned API/data offering integration while legal prepares the DocuSign agreement, and enabled Data Dumps for the project's ClientID.

Business implication:
The broader catalogue no longer needs to wait on the signature process. This is materially useful because catalogue breadth is one of the prerequisites for making GrailRaven useful enough for later acquisition.

Near-term order is now:
1. verify Data Dump access;
2. record the written IGDB commercial integration authorization in the repository gate;
3. promote the validated 8,433-game metadata catalogue with IGDB attribution;
4. keep artwork disabled until the legal agreement is reviewed or image rights are otherwise confirmed;
5. continue toward authorised marketplace/pricing coverage;
6. review/sign the DocuSign agreement when it arrives.

This does not change the decision to defer active community promotion until the marketplace/search loop is materially more complete.


## Catalogue breadth milestone reached — 12 October 2026

The IGDB-backed canonical catalogue is now live with 8,462 PS1/PS2/Dreamcast game-platform records while preserving the 100 PALScout-deep launch records.

This removes catalogue breadth as the main immediate product blocker. The dominant remaining usefulness gap is authorised marketplace inventory and trustworthy pricing/comparison data.

Do not interpret the broader catalogue as a reason to begin active community promotion yet; the prior distribution-timing decision still stands until the Search -> Filter -> Compare -> Alert loop has meaningful live inventory/pricing utility.


## PriceCharting feasibility evidence — 13 October 2026

Two real one-month Legendary-subscriber tests materially changed the inventory strategy:
- pinned 100 PALScout games: **88** PAL reference-pricing candidates but only **26** safe exact UPC/EAN matches; **3** available marketplace offers, **0** confirmed UK-exact offers
- unrestricted-by-title console-based PAL Marketplace availability: **5 PS1 + 3 PS2 + 0 Dreamcast = 8 offers returned in total**, with no evidence establishing UK purchasing/shipping availability

The wider sample supports the conclusion that PriceCharting's Marketplace is **not adequate as GrailRaven's primary supply**. Published API documentation does not describe offers pagination; avoid treating eight as a guaranteed exhaustive total. PriceCharting's FAQ also calls out US/Canada buyer/seller support, suggesting additional limitations for a UK-targeted platform.

Maintain the business objective and exact-copy search wedge, but **do not assume PriceCharting Marketplace solves the inventory blocker** and do not pay for recurring data access without a realistic near-term usefulness/revenue case. PriceCharting prices may still be useful as licensed release-safe reference data; this is a separate decision. Seek authorised UK-relevant feeds, partnerships or buyer-supplied listing workflows; do not evade eBay developer restrictions. Subscription renewal must be explicitly evaluated before next billing.

Aggregate benchmark report: `PRICECHARTING_REAL_BENCHMARK_2026-10-13.md`.


## International product positioning reaffirmed — 13 October 2026

**GrailRaven is an international exact-copy collector service**, initially validating its acquisition intelligence through UK/European PAL launch targets. **PALScout is a regional/release intelligence layer** within the global parent product. Do not recast the whole business as UK-only because current engineering/benchmarks are PAL-led. A later sequence of US NTSC-U, Japanese NTSC-J, more marketplaces and platforms remains a documented ambition, subject to access, release-evidence quality and actual demand.

Two paid PriceCharting benchmarks sampled **PAL only** (100 chosen games; then full PAL console offer categories). **They cannot establish US or JP PriceCharting price coverage or Marketplace offer depth.** The weak PAL Marketplace supply rules out using that subset as the primary launch live-inventory source, *not* PriceCharting as a potential worldwide reference-pricing source. PriceCharting's own site has separate US, PAL and Japanese price guides.

**Distinct data roles:**
- authorised live-inventory API such as future eBay Browse: active listings, seller/offer evidence, candidate search; eBay API eligibility remains rejected and cannot be bypassed;
- PriceCharting: licensed *estimated current market prices* (loose/CIB/new etc.) calculated from historic sales, with region/edition matching and attribution; eBay's standard Browse listing API does not replace this valuation feed, and eBay's Marketplace Insights API is restricted.
- release classification/compatibility/confidence: GrailRaven's own independent exact-copy intelligence.

One month Legendary already purchased by user. **Do not assume renewal.** User is deciding whether to request a discretionary refund now vs use the remainder to measure US/JP price matching. The official website Terms/FAQ do not clearly promise general website subscription refunds, and real API calls have already been used. If refund requested, do not perform further real API benchmarks until the provider responds. If user opts to finish the month, a narrowly scoped US/JP *pricing* test would be useful and cannot be conflated with PAL exact release performance; cancellation before renewal is the default unless commercial value is demonstrated. Historical PriceCharting public-use permission was obtained under RetroNomad for the *described launch use*; confirm any materially expanded publicly displayed global use and name-change before production.


## US PriceCharting inventory scope correction — 13 October 2026

The international six-call sort-comparison [run 38448105573](https://github.com/channel9ch9-source/retronomad/actions/runs/38448105573) established a minimum of **153 distinct US available retro-game Marketplace offers** returned across PS1 (60), PS2 (60), and Dreamcast (33). The previous first-pass '90 US offers' were three *30-result query windows* and do not reflect total US inventory. Every console showed a different offer union when the supported sort was changed. Official API pagination and exhaustive total size still unknown.

This materially improves the international Marketplace outlook but does not by itself establish eBay-like coverage, practical global purchasing, precise physical-release verification, sustainable live alerts or willingness to pay. **Do not generalise the very sparse PAL listings to the full international GrailRaven market**, and do not treat the US minimum as an exhaustive US market size. PriceCharting's more convincing current role remains potential **licensed current reference-pricing** rather than proven primary worldwide inventory. No recurring Legendary expense until the user deliberately authorises it based on clear business utility. Full aggregate evidence in `PRICECHARTING_INTERNATIONAL_BENCHMARK_2026-10-13.md`.

## Owner income and commercial-validation priority — 17 October 2026

**Owner's explicit business objective:** GrailRaven is a serious attempt to create a dependable, sustainable income stream to support independent living and long-term location flexibility. The business is **pre-revenue**. Success is not guaranteed; do not impose a speculative deadline for replacing living expenses, or treat anticipated earnings as current funds. Keep private personal and benefit details out of the repo.

**Major-work filter:** Every substantial development or commercial effort should materially improve one or more of: (1) collector acquisition, (2) retention/return visits, (3) willingness to pay and real net income, or (4) defensible exact-copy release intelligence. Do not prioritise feature count or catalogue size without evidence of customer value.

**Practical commercial sequence:**
1. Make the **Search -> Filter -> Compare -> Alert** workflow genuinely useful with authorised, fresh, region/edition/completeness-correct inventory. Sparse individual PriceCharting offers are insufficient proof of value. Keep evidence and REVIEW gates.
2. **Await external data-source responses**: enquiries to Chillout Games, eStarland and RetroFix were sent on 14 October 2026. No licence/sample feed confirmed by the latest owner update. Do not chase immediately, fabricate access, scrape retailers or circumvent rejected eBay API access. A private rights-gated CSV/JSON intake and 20-intent benchmark have already been implemented and tested; use only on a written-authorised real sample, measure incremental correct-copy availability and partner economics, then decide whether to integrate.
3. Once real inventory usefulness is strong enough, run measured collector acquisition/feedback experiments. Continue legitimate SEO/organic discovery meanwhile; avoid premature broad forum promotion. Measure searches, listing relevance and clicks, Saved Hunts, return visits, alert usefulness, customer referrals and real demand.
4. Test actual willingness to pay when there is repeatable collector value. Provisional freemium Collector plan around **£3.99/month** remains a hypothesis, not proven revenue. Affiliate/referral opportunities depend on permission and economics; advertisements are not the default model.
5. **Financial proof milestones:** first real paying customer -> **£100/month recurring** -> repeatably increasing **net monthly profit after provider, infrastructure and acquisition costs**. Track churn and unit economics. These are validation checkpoints, not a guaranteed timeline.
6. Reassess the offer/positioning if serious, appropriately measured acquisition and retention/payment experiments reveal poor demand. Protect limited business funds: no automatic paid provider renewal, new subscription or advertising commitment without owner approval and a clear usefulness/business case.

**Dependencies and safeguards, as of 17 October:**
- Expanded **8,462-game IGDB catalogue already published**; owner's keep-published decision remains. Formal DocuSign partnership terms still awaiting review; no publication rollback, D1/Cloudflare changes, flags or artwork changes authorised here.
- **PriceCharting** has exploratory live US REVIEW offers for individual games and poor observed PAL Marketplace offer coverage. Its possible release-safe reference-price role is distinct from authorised live-inventory supply. Single-month Legendary purchase is not a renewal commitment.
- **Chillout Games, eStarland, RetroFix:** outreach sent; no approved feed or licence received. Existing private intake/synthetic E2E tests are ready. No production import or unlicensed redistribution.
- **eBay:** developer API application rejected; no scraping or bypass.

**Owner financial-stability principle:** Build GrailRaven sustainably rather than counting on immediate income to finance relocation/housing. This is a strategy and documentation update only, not permission to deploy, buy subscriptions, contact partners immediately or change existing provider data.
