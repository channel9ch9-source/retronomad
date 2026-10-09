# GrailRaven Product Vision

Last updated: 2 October 2026

This file is the durable product anchor for the current public brand, **GrailRaven**. Technical implementation should be checked against this purpose before major changes.

The business objective, monetisation direction, validation plan and financial-success decision rules are defined in `BUSINESS_DIRECTION.md`. Product work should satisfy both documents.

The previous working/public name was **RetroNomad**. Historical internal identifiers may retain that name for compatibility; branding should not be coupled to core architecture. See `BRAND_NAMING.md` and `brand.json`.

## Business objective

GrailRaven is being built as a serious attempt to create a **financially meaningful, sustainable software business**.

The project must not drift into feature-building for its own sake. Major work should materially support at least one of:
- customer acquisition
- retention
- willingness to pay
- defensibility

The intended commercial wedge is exact-copy acquisition intelligence, not generic collection tracking.

See `BUSINESS_DIRECTION.md` for the durable business strategy, monetisation direction, validation criteria, eBay reapplication plan and mobile-app decision rules.

## Core proposition

**Find the right copy at the right price.**

GrailRaven is an **exact-copy hunting assistant for physical game collectors**.

The primary customer journey is search-first:

**Search → Filter → Compare → Alert**

A customer comes to GrailRaven and searches for a game, defines the kind of physical copy they actually want, and GrailRaven searches authorised/current marketplace inventory for suitable listings when validated providers are connected.

The product must not become primarily a pasted-listing checker. The listing checker is a secondary utility.

## Product differentiation

Marketplace search, price tracking and alerts are important delivery mechanisms, but they are not sufficient differentiation on their own.

GrailRaven's intended edge is **exact physical-release intelligence**.

The product should answer a collector request like:

**Silent Hill · PS1 · UK-market PAL · original release · correct edition · complete in box · acceptable condition · under £80 delivered**

and avoid silently treating French/German PAL, Platinum/reissue, NTSC, incomplete, bundled or otherwise wrong-release copies as equivalent merely because the game title matches.

Most importantly, uncertainty must remain visible. A candidate may be:
- **MATCH** — evidence supports the requested copy
- **REVIEW** — it may fit, but required release/completeness evidence is unresolved
- **FILTERED** — evidence proves it violates the target

The product should prefer an honest REVIEW state over false certainty.

## PALScout

PALScout is GrailRaven's UK/European regional/release intelligence layer.

PALScout answers:

**Compatibility → Region → Exact release → Edition → Completeness**

Initial focus is UK and European PAL physical releases.

Important distinction:
- PAL-compatible does not mean UK-market.
- A French, German, Spanish or other European PAL release may work on standard UK/European PAL hardware while still having non-UK packaging, language or collector-market identity.
- Generic PAL evidence is not enough to claim UK exact.

## Phase 1 — Deal Finder + Saved Hunts

Primary customer workflow:

1. Search GrailRaven by game.
2. Choose platform and physical-copy requirements.
3. GrailRaven searches authorised marketplace inventory when a legitimate provider is connected.
4. PALScout classifies candidate listings.
5. Wrong-region, wrong-edition, incompatible, incomplete or otherwise disallowed copies are filtered/reviewed.
6. Compare matching copies using delivered price and, when licensed pricing is available, the correct exact-release/completeness reference.
7. Save a Hunt and request an alert for a future matching listing.

Example target:

**Silent Hill · PS1 · PAL · original release · complete in box · under £80 delivered**

Saved Hunts must preserve the exact buying target rather than only the game title.

## Phase 2 — “Should I buy this?”

Secondary utility for a specific listing.

Given a listing, GrailRaven should combine:
- exact-release identification
- PALScout compatibility/release intelligence
- edition
- completeness
- condition evidence
- trustworthy exact-release pricing reference
- current asking price + postage
- evidence/confidence

The existing listing analyser belongs here.

## Phase 3 — Photo / Lot Analyzer

A buyer can submit a photo of a pile, collection or batch of games.

GrailRaven should:
- identify visible titles/releases where evidence permits
- separate uncertain identifications from confident ones
- estimate value only from trustworthy release-specific pricing
- highlight potentially worthwhile items
- never turn ambiguous visual evidence into false certainty

## Phase 4 — Expansion

After the UK/PAL launch loop is reliable:
- additional authorised marketplaces
- NTSC-U / US
- NTSC-J / Japan
- more platforms
- richer collector/release intelligence
- broader alert and comparison features

Expansion should follow evidence quality and provider access, not catalogue-size vanity metrics.

## Launch catalogue

Initial structured release work covers 100 game/platform pairs:
- PS1: 40
- PS2: 40
- Dreamcast: 20

The dataset is deliberately evidence-led.

## Product safety / trust rules

GrailRaven must not:
- fabricate live listings
- fabricate sold-data averages or prices
- present an unresolved release as exact
- label something a good deal without a trustworthy comparison basis
- weaken ambiguity gates merely to increase match coverage
- scrape or evade marketplace access controls after API rejection
- treat generic European PAL evidence as UK-specific

Marketplace adapters provide evidence. They do not decide release identity themselves.

When evidence conflicts or a required fact is unknown, use **REVIEW** rather than guessing.

## Current external dependencies

Live marketplace discovery requires legitimate authorised inventory access.

Trusted price comparison requires a provider/licence suitable for public GrailRaven display.

PriceCharting has approved the documented launch use, but real 100-title pricing and Marketplace-offer coverage still need validation before public provider activation.

Until validated providers are enabled, the product should make limitations explicit and continue improving the search, classification, Saved Hunt, account and backend foundations without inventing data.

## Brand relationship

**GrailRaven** is the current parent/global public brand.

**PALScout** is the regional/release intelligence layer underneath it.

The architecture should allow future US/Japanese intelligence without making PALScout the entire product identity.

The parent brand may change again in the future; core architecture must remain independent of that choice.
