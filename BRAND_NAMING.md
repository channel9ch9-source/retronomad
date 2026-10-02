# Brand / Naming Context

Last updated: 2 October 2026

This file records the stable naming context for the project so branding decisions do not require renaming core product architecture.

## Current public brand

The current public-facing product name is **GrailRaven**.

Owned domain:
- `grailraven.com`

Primary human/business mailbox:
- `contact@grailraven.com`

**GrailRaven is the current brand, but it is intentionally not treated as a permanent internal codename.** The name was difficult to secure and may be replaced later if a materially better brand becomes available.

## Rebrand architecture rule

Future brand changes should be presentation/infrastructure changes rather than product rebuilds.

Therefore:
- keep core modules, schemas, database concepts, API routes and classifier/matcher logic brand-neutral wherever practical
- do not rename stable internal identifiers merely to remove an older brand name
- existing `retronomad-*` infrastructure names, browser storage keys and code namespaces may remain as legacy implementation identifiers when changing them would add migration risk without customer benefit
- do not introduce new `grailraven-*` internal identifiers unless a branded identifier is actually required
- public brand metadata should come from the central `brand.json` configuration wherever the deployment path allows it
- if the public brand changes again, update the central brand configuration, presentation assets, domain/email configuration and only the infrastructure that genuinely needs a customer-facing rename

This deliberately separates **brand identity** from **product architecture**.

## Previous public/working name

The project was previously developed under **RetroNomad**.

Historical project records, commit messages, repository paths, storage keys and infrastructure names may continue to contain `RetroNomad` / `retronomad`. Those references are not evidence that the old name remains the public brand.

The GitHub repository may remain `channel9ch9-source/retronomad` for now. Renaming the repository, D1 database, Worker, storage keys or existing namespaces is not required for the GrailRaven public rebrand.

## Product naming requirements

The parent brand must fit the actual product, not just sound retro.

Product purpose:
- exact-copy hunting assistant for physical game collectors
- search authorised marketplace inventory
- identify the exact physical release/region/edition/completeness
- filter wrong copies rather than matching only by game title
- compare against trusted release-safe reference pricing
- save hunts and alert when matching copies appear

Core proposition:
**Find the right copy at the right price.**

Product flow:
**Search -> Filter -> Compare -> Alert**

PALScout remains the UK/European release-intelligence layer underneath the global parent product unless a later product decision changes that.

## Product differentiation to preserve in the brand

Marketplace search, pricing and alerts are enabling features, not the main moat. Competing products already offer variants of those capabilities.

The intended differentiation is **exact physical-release intelligence**:
- compatibility
- region
- exact release / country-market identity
- edition / reissue
- completeness
- language / packaging evidence
- evidence/confidence and REVIEW rather than invented certainty

The product should be positioned closer to:

> Tell us exactly which physical release you want. We find the right copy, filter out the wrong ones, compare the price and watch the market for you.

rather than merely "a retro-game deal finder."

## If another rename is considered

Before replacing GrailRaven:
1. confirm exact `.com` availability/ownership situation
2. check obvious web/business conflicts
3. perform a focused trademark search in relevant software/online-service/gaming-adjacent classes
4. judge the name against the exact-copy hunting proposition
5. make the change through the brand/configuration layer rather than renaming core internals

## Rebrand impact

A customer-facing rename at the current stage remains manageable and does not require rebuilding the product.

Core systems should remain intact:
- release evidence
- PALScout classifier
- marketplace adapters
- D1 data
- accounts
- Saved Hunts
- search/matching logic
- pricing logic

Internal identifiers such as local-storage keys or code namespaces do not need to be renamed; if they are changed later, migrations must preserve existing user data.
