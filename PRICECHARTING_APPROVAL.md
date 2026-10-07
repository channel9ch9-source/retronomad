# PriceCharting Approval

Last updated: 2 October 2026

This file records the business-development approval received from PriceCharting for the project's intended public use of PriceCharting data and Marketplace offers.

## Brand-name note — 2 October 2026

The written approval described below was obtained while the project was publicly/working under the name **RetroNomad**.

The current public brand is now **GrailRaven** (`grailraven.com`). The underlying product, use case and intended PriceCharting integration have not changed.

Do **not** rewrite the historical approval as though PriceCharting originally approved the GrailRaven name. Before production PriceCharting data/Marketplace use under the new public brand, notify the PriceCharting business-development contact of the rename and confirm that the existing approved arrangement continues under GrailRaven. Do not invent or assume any new commercial terms.

## Approved launch arrangement

PriceCharting confirmed that RetroNomad's described use case is supported.

Until the project reaches **$1,000/month in total project revenue**:
- the project may use a **PriceCharting Legendary subscription ($50/month)** to access PriceCharting data via API under the approved arrangement.
- the product must **cite/attribute PriceCharting**, using an icon or text with a link back to PriceCharting's product page.

Once the project reaches **$1,000/month in total revenue**:
- PriceCharting intends to move the project to a **formal Commercial Agreement**.
- the commercial structure is expected to use a **small revenue share**.
- exact future commercial terms are not yet documented here and must not be invented.

## Public pricing use

PriceCharting explicitly approved the described product calculating descriptive comparisons from licensed PriceCharting values, including:
- below reference
- near reference
- above reference

This means Pricing v1 can use PriceCharting as the reference-value source after a release-safe match and display descriptive comparison language, subject to attribution and the subscription/commercial terms above.

## Marketplace offers

PriceCharting explicitly approved the described product displaying and linking to **PriceCharting Marketplace offers** returned by the Marketplace API, including `/api/offers`, with appropriate PriceCharting attribution.

This gives the project a legitimate first live-inventory source independent of eBay developer access, subject to the brand-name confirmation noted above.

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
-> target matching
-> PriceCharting release-safe reference pricing
-> descriptive below/near/above-reference comparison
-> Saved Hunts / alerts

PriceCharting Marketplace can serve as one authorised inventory provider after real validation:

PriceCharting `/api/offers`
-> normalised marketplace listing
-> PALScout classifier
-> MATCH / REVIEW / FILTERED
-> PriceCharting pricing reference
-> result card / alert

## Current implementation status

Completed before paying for real access:
1. product/brand/domain decision reached for the current GrailRaven brand
2. server-side PriceCharting provider adapter built against the documented API contract
3. PriceCharting attribution-ready result rendering added
4. 100-title pricing benchmark harness added
5. separate Marketplace-offer benchmark mode added

Still required:
1. notify PriceCharting of the RetroNomad -> GrailRaven rename and confirm the existing arrangement carries over
2. finish public-domain/Resend deployment setup
3. subscribe to Legendary only when ready for real API calls
4. store the API token only as a Cloudflare Worker secret
5. run the 100-title UK/PAL pricing benchmark
6. run the separate 100-title Marketplace offer-coverage benchmark
7. measure exact identifier/product-ID matching, PAL/region safety, completeness mapping, available-offer volume and UK usefulness
8. do not assume PriceCharting Marketplace replaces eBay unless the coverage benchmark supports that conclusion
9. use the legitimate integration as supporting evidence in a future transparent eBay developer-account reconsideration/reapplication

## Accuracy rule

PriceCharting approval solves the permission/licensing blocker for the described launch use under the recorded arrangement. It does **not** prove coverage quality, inventory depth, exact-release matching accuracy or eBay-equivalent marketplace supply. Those must be measured before making product claims.


### Readiness update — 7 October 2026

The pre-subscription engineering work is now concretely implemented and regression-protected:
- visible conditional PriceCharting attribution/linkback exists in Search live-result rendering
- reference-price and Marketplace normalization expose attribution metadata server-side
- the 100-title pricing benchmark harness exists
- the 100-title Marketplace-offer benchmark harness exists
- both harness modes can run offline against deterministic fixtures with no token/network access
- a safe fixture-validation GitHub Actions workflow is available
- the future real-token benchmark workflow is hard-gated and does not enable the public marketplace provider

No real coverage or inventory claim is made from fixture mode. Only a future paid-token run may establish real PriceCharting coverage.
