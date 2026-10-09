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

Reapply later from a materially stronger position, ideally with:
- a functioning public product
- a broader legitimate catalogue
- clear privacy/account controls
- demonstrated exact-copy classification
- real user activity/traffic where available
- a concise legitimate Browse/API use case
- an explanation that GrailRaven helps collectors identify relevant listings and sends users back to the marketplace
- accurate identity/business/project information

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
