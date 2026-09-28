# PriceCharting Approval

Last updated: 28 September 2026

This file records the business-development approval received from PriceCharting for RetroNomad's intended public use of PriceCharting data and Marketplace offers.

## Approved launch arrangement

PriceCharting confirmed that RetroNomad's described use case is supported.

Until RetroNomad reaches **$1,000/month in total RetroNomad revenue**:
- RetroNomad may use a **PriceCharting Legendary subscription ($50/month)** to access PriceCharting data via API.
- RetroNomad must **cite/attribute PriceCharting in the product**, using an icon or text with a link back to PriceCharting's product page.

Once RetroNomad reaches **$1,000/month in total revenue**:
- PriceCharting intends to move RetroNomad to a **formal Commercial Agreement**.
- The commercial structure is expected to use a **small revenue share**.
- Exact future commercial terms are not yet documented here and must not be invented.

## Public pricing use

PriceCharting explicitly approved RetroNomad calculating descriptive comparisons from licensed PriceCharting values, including:
- below reference
- near reference
- above reference

This means Pricing v1 can use PriceCharting as the reference-value source after a release-safe match and display descriptive comparison language, subject to attribution and the subscription/commercial terms above.

## Marketplace offers

PriceCharting explicitly approved RetroNomad displaying and linking to **PriceCharting Marketplace offers** returned by the Marketplace API, including `/api/offers`, with appropriate PriceCharting attribution.

This gives RetroNomad a legitimate first live-inventory source independent of eBay developer access.

Important limitation:
- approval does not establish how much useful UK/PAL inventory the PriceCharting Marketplace actually contains.
- inventory coverage must be benchmarked before treating it as sufficient for the Deal Finder.
- eBay remains an important future marketplace candidate if authorised developer access becomes available.

## Development access

PriceCharting confirmed that it does **not** provide free development/test access.

Therefore:
- do not buy the subscription merely to start writing the adapter.
- implement the provider adapter and test fixtures first against the documented contract.
- subscribe when the integration is ready for real API validation.
- never expose the PriceCharting token in browser/client code or GitHub.
- store the production token only as a server-side Cloudflare secret.

## Current API/documentation constraints

PriceCharting's current public documentation states:
- paid subscription is required for API access.
- API authentication uses a private token.
- normal API limit is one call per second.
- API/CSV data can and should be cached server-side.
- API/CSV data must be purged after the subscription ends.
- Legendary includes daily CSV download access.
- Prices API provides current values, not historical prices or historic sales.
- Marketplace API includes `/api/offers` for marketplace offers.

If documentation and the direct business-development approval conflict, preserve the written approval and ask PriceCharting before assuming broader rights.

## Integration direction

Target architecture:

Authorised marketplace inventory
-> PALScout exact-release classification
-> RetroNomad target matching
-> PriceCharting release-safe reference pricing
-> descriptive below/near/above-reference comparison
-> Saved Hunts / alerts

PriceCharting Marketplace can now serve as one authorised inventory provider:

PriceCharting `/api/offers`
-> normalised marketplace listing
-> PALScout classifier
-> MATCH / REVIEW / FILTERED
-> PriceCharting pricing reference
-> RetroNomad result card / alert

## Next implementation steps

1. Finish the product/brand/domain decision before creating long-lived branded infrastructure.
2. Build a server-side PriceCharting provider adapter against the documented API contract without using a real token yet.
3. Add PriceCharting attribution support to relevant result/pricing UI.
4. When the adapter is ready, subscribe to Legendary and store the API token only as a Cloudflare Worker secret.
5. Run the existing 100-title UK/PAL release-safe pricing benchmark against PriceCharting.
6. Separately benchmark current PriceCharting Marketplace offer coverage for the same launch catalogue.
7. Measure exact identifier/product-ID matching, PAL/region safety, completeness mapping, available-offer volume and UK usefulness.
8. Do not assume PriceCharting Marketplace replaces eBay unless the coverage benchmark supports that conclusion.
9. Use the legitimate PriceCharting integration as supporting evidence in a future transparent eBay developer-account reconsideration/reapplication.

## Accuracy rule

PriceCharting approval solves the permission/licensing blocker for the described launch use. It does **not** prove coverage quality, inventory depth, exact-release matching accuracy or eBay-equivalent marketplace supply. Those must be measured before making product claims.
