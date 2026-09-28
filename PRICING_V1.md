# RetroNomad Pricing v1

Last updated: 29 September 2026

## Current automatic provider status

RetroTechCollector Developer/Data API was the first Pricing v1 automatic-provider pilot.

After three real-key coverage passes across the 100-title launch catalogue, it is **not suitable as RetroNomad's primary UK/PAL pricing provider**.

Final diagnostic-v3 result:
- 100/100 titles attempted
- 1 safe exact UPC/EAN price match
- 33 strong title/platform price matches whose catalogue region was null
- 62 no usable provider matches
- 4 weak matches
- 0 title-price matches with an explicitly confirmed PAL region

The single safe exact identifier hit was Rez on Dreamcast.

RetroTechCollector may remain as a **limited exact-identifier supplemental source**, but RetroNomad must not use its title-only values when release region is unknown.

Provider documentation states that its market values come from PriceCharting. The v3 results showed that title fallback frequently resolved to a different regional product record than RetroNomad's PAL identifier, so those values are not release-safe for the current product.

PriceCharting is now the approved primary provider candidate for the next UK/PAL pricing and Marketplace validation stage. Public-use permission has been obtained for the described RetroNomad launch use, but real coverage, inventory depth and exact-release accuracy are still unproven and must be benchmarked before production use.

## Beta mode: BYOK

The public analyser accepts a user's own RetroTechCollector developer key.

Security:
- stored only in sessionStorage (current browser tab/session)
- never written to GitHub
- never included in exported pricing-reference JSON
- never sent to RetroNomad because GitHub Pages has no RetroNomad backend
- only sent directly from the user's browser to RetroTechCollector

Required key scopes:
- catalogue:read
- prices:read

Automatic flow:
1. Listing must be Comparison-ready.
2. RetroNomad builds the exact game/platform/release/completeness context.
3. If a numeric barcode/EAN exists, query the provider price endpoint by that identifier.
4. Require an equivalent returned barcode, an allowed provider platform label, and strong title agreement.
5. **If the exact barcode price lookup misses, do not fall back to title pricing.** A failed PAL identifier followed by a title match can silently substitute an NTSC/other-region price.
6. If no numeric barcode is available, title search may be attempted.
7. A title-only price match is usable only when the provider catalogue detail explicitly identifies the matched record as PAL.
8. Reject weak and ambiguous matches.
9. Map the RetroNomad bucket to the provider field.
10. Convert USD to GBP using a daily central-bank reference FX rate.
11. Populate Pricing v1 only after a release-safe match.
12. Manual source-backed references remain available as fallback.

Provider bucket map:
- CIB -> cib
- Loose -> loose
- New -> new
- Box Only -> boxOnly
- Manual Only -> manualOnly
- Incomplete / Condition-specific -> no automatic provider price

## Coverage validation

A browser-side validation runner lives at:

- `pricing-coverage.html`

It is an internal/developer tool for roadmap validation, not a source of fabricated coverage claims.

The runner:
- derives the 100 launch game/platform pairs from `release-evidence.js`
- prefers a safe numeric barcode/EAN when one is present in RetroNomad evidence
- tests the provider price endpoint by UPC/EAN first
- falls back to title-price discovery only for diagnostics
- records provider platform labels, UPCs, catalogue region and available price buckets
- rejects weak or ambiguous title matches
- distinguishes exact identifier matches from region-unknown title matches
- paces calls below the documented provider burst limit
- exports a JSON report that never contains the developer key

Real-key coverage validation is complete for the RetroTechCollector launch pilot. The three diagnostic passes established that RetroTechCollector has only one release-safe exact-identifier price match in the current 100-title PAL launch set, so it is not the primary provider path going forward.

The same 100-title benchmark methodology must now be adapted/run against PriceCharting after the server-side integration is ready for real API validation.

## Production mode

A public shared provider key must never be embedded in analyze.html or any other browser-delivered asset.

A serverless RetroTechCollector proxy template lives at:
`backend/rtc-pricing-worker.js`

A server-side PriceCharting provider scaffold now lives at:
`backend/pricecharting-provider.js`

Before deploying any shared provider key:
1. confirm the intended provider and approved use
2. store its API token only as a server-side secret
3. restrict allowed origin where applicable
4. preserve provider rate limits and caching requirements
5. log provider-match failures without logging secrets
6. keep ambiguous matching as an error/review state, not a guess

## PriceCharting approval

The authoritative approval record is:
`PRICECHARTING_APPROVAL.md`

PriceCharting explicitly approved RetroNomad's described public pricing use and display/linking of PriceCharting Marketplace offers.

Approved launch arrangement:
- until RetroNomad reaches **$1,000/month in total RetroNomad revenue**, use a **PriceCharting Legendary subscription ($50/month)** for API access
- attribute PriceCharting in the product with an icon or text link back to the relevant PriceCharting product page
- once RetroNomad reaches **$1,000/month in total revenue**, PriceCharting intends to move RetroNomad to a formal Commercial Agreement using a small revenue share
- the exact later commercial terms are not yet documented and must not be invented

Approved pricing language includes descriptive comparison of release-safe PriceCharting values, such as:
- below reference
- near reference
- above reference

PriceCharting also approved RetroNomad displaying/linking Marketplace offers returned by the Marketplace API, including `/api/offers`, with appropriate attribution.

Approval removes the permission/licensing blocker for the described launch use. It does **not** prove:
- 100-title UK/PAL coverage
- exact-release match quality
- condition/completeness mapping quality
- Marketplace offer depth
- practical UK usefulness
- eBay-equivalent inventory supply

Those must be measured before production claims or enabling autonomous monitoring.

## PriceCharting server-side scaffold

Implementation record:
`PRICECHARTING_PROVIDER_V1.md`

Current scaffold:
- uses the dedicated PAL namespaces for PS1, PS2 and Dreamcast
- discovers candidate products through `/api/products`
- fetches product detail through `/api/product`
- supports exact UPC/EAN lookup through `/api/product?upc=...`
- fetches available Marketplace offers through `/api/offers`
- preserves PriceCharting product IDs, UPC/EAN, include/completeness wording and condition wording as evidence
- returns normalised Marketplace rows for the existing PALScout -> matcher pipeline
- does not let the provider decide release identity
- throttles/caches calls according to the documented API constraints
- never exposes the private token in returned data or errors

Fixture QA on 29 September 2026: **6/6 passed**.

This is contract/logic QA only. No real PriceCharting token has been used and no real coverage result is claimed yet.

Important price boundary:
PriceCharting Marketplace offers are retained as USD item prices. The scaffold does not fabricate postage, delivered totals or delivered GBP. A Hunt with a delivered-GBP ceiling must therefore remain unresolved/review until RetroNomad has source-backed delivered-price handling for that offer.

## Next PriceCharting validation sequence

1. Add user-visible PriceCharting attribution support to pricing/result UI.
2. Keep public Worker provider mode disabled while fixture work is being completed.
3. When ready for real validation, purchase the approved Legendary subscription.
4. Store `PRICECHARTING_TOKEN` only as a Cloudflare Worker secret.
5. Run the 100-title release-safe PriceCharting pricing benchmark.
6. Separately run the 100-title PriceCharting Marketplace offer-coverage benchmark.
7. Measure exact identifier/product-ID matching, PAL safety, completeness mapping, current-offer volume and UK usefulness.
8. Only after those benchmarks decide whether PriceCharting should be enabled in the public Deal Finder / scheduled Saved Hunt monitor.
9. Do not assume PriceCharting Marketplace replaces eBay unless the measured inventory supports that conclusion.

MyPlayersVault remains a possible research candidate because it publicly separates UK/PAL, NTSC-U and NTSC-J values, but no documented developer API suitable for RetroNomad has been established yet.

## FX

RetroTechCollector price snapshots are documented in USD.

Pricing v1 converts them to GBP with Frankfurter daily reference rates. This is suitable for reference-price comparison, not live FX trading.

PriceCharting reference values and Marketplace offers are also USD-based in the current API contract. Exact release matching must happen before any reference-price conversion. Marketplace delivered-price handling must remain separate from reference-price FX conversion because postage/delivery information cannot be invented.

## Product-language rule

Pricing v1 may say:
- below reference
- near typical reference
- above reference
- reference unavailable
- provider match ambiguous

It must not turn a weak/ambiguous classification into a pricing conclusion and must not fabricate a price when no provider data exists.
