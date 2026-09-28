# Brand / Naming Context

Last updated: 28 September 2026

This file records the stable naming context for the project so a separate brainstorming chat can start fresh without losing product requirements.

## Current working name

The current working product name remains **RetroNomad** until a replacement is deliberately chosen.

Do not rename code, infrastructure, repository identifiers, storage keys, Cloudflare resources, emails or public copy merely because alternatives are being brainstormed.

## Why a rename is being considered

RetroNomad is not known to be categorically unusable. The rename discussion is driven by long-term brand/domain quality rather than a confirmed prohibition.

Relevant concerns:
- `retronomad.com` is already registered and is not currently available for normal registration.
- the product is intended to become a global app/site, so owning the exact `.com` is strongly preferred.
- there are some unrelated or adjacent uses of the RetroNomad/Nomad name online.
- preliminary trademark-oriented research did not establish a definite bar to RetroNomad, but the NOMAD element has some software/gaming-adjacent use, so the name is not perfectly clean.
- because the product is still early, this is the lowest-cost point to choose a stronger global name if one is found.

## Naming requirements

A replacement should fit the actual product, not just sound retro.

Product purpose:
- retro-game buying/deal-finder assistant
- search authorised marketplace inventory
- identify the exact physical release/region/edition/completeness
- filter wrong copies
- compare against trusted reference pricing
- save hunts and alert when matching copies appear

Core proposition:
**Find the right copy at the right price.**

Product flow:
**Search -> Filter -> Compare -> Alert**

PALScout remains the UK/European release-intelligence layer underneath the global parent product unless a later product decision changes that.

Preferred brand qualities:
- suitable for a global consumer app/site
- memorable and reasonably distinctive
- professional enough for marketplace/API partners such as eBay and PriceCharting
- not locked to PAL, the UK, one console generation or one marketplace
- ideally the exact `.com` is available at normal registration cost
- avoid obvious existing retro-gaming businesses, marketplace services or software products using the same/confusingly similar name
- avoid choosing solely because a `.co.uk` is available if the exact `.com` is permanently unavailable and the goal is a global brand

## Current process

A separate ChatGPT thread may be used purely for fresh naming brainstorms.

That thread should treat this file and `PRODUCT_VISION.md` as the product brief. It does not need to preserve every historical brainstorm. Only a serious finalist or final naming decision needs to be written back into the durable project records.

Before buying a domain or rebranding the product:
1. confirm exact `.com` availability/ownership situation
2. check obvious web/business conflicts
3. perform a focused UK/EU trademark search in relevant software/online-service/gaming-adjacent classes
4. then choose the final brand

## Rebrand impact

A customer-facing rename at the current stage is manageable and does not require rebuilding the product.

Core systems can remain intact:
- release evidence
- PALScout classifier
- marketplace adapters
- D1 data
- accounts
- Saved Hunts
- search/matching logic
- pricing logic

Internal identifiers such as local-storage keys or code namespaces do not need to be renamed immediately; if they are changed later, migrations should preserve existing user data.
