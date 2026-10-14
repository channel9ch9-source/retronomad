# GrailRaven public US PriceCharting Marketplace v1

Prepared 14 October 2026. **Committed and CI-checked, but not yet deployed to the Cloudflare production Worker until the owner manually runs the normal Deploy app to Cloudflare workflow.** No second paid subscription month is authorised.

## User decision

The owner explicitly directed public display of real PriceCharting prices and Marketplace listings at grailraven.com, and does not want another PriceCharting contact about rebranding. The code implements the user's stated choice without a new provider email. The existing PriceCharting commercial licence, required attribution and subscription data-retention terms continue to apply.

## User-facing scope

Search → select **NTSC-U (US marketplace)** → choose a canonical PlayStation 1 / PlayStation 2 / Dreamcast game → Search.

PriceCharting offers appear as **REVIEW-only** cards with one recognised provider thumbnail, USD asking price, seller-stated contents/condition/description, and two PriceCharting links (real offer and product/source attribution). No item is automatically deemed exact edition/CIB, physically US, a good deal, or eligible for a particular destination. Postage, delivered totals, and GBP conversion are deliberately unknown. User's other completeness/condition filters are **intent**, not verified result predicates for this first provider.

UK and other European region search retains PALScout logic and its existing demo/placeholder display. NTSC-J remains planned; US results do not pass through UK PAL classification. Saved US hunts retain a separate US compatibility field. Monitoring/alerts remain disabled even while manual US lookup is live.

## Server scope / endpoints

- Same-origin GET: \`/api/marketplace/pricecharting/us?game=<title>&platform=PS1|PS2|Dreamcast\`.
- Server Worker \`backend/alerts-worker.js\` calls \`handlePublicPriceChartingSearch\` in \`backend/pricecharting-public.js\`.
- That module runs the pretested \`searchUsPriceChartingReview\` adapter with **at most 2** PriceCharting product candidates, no offer-details API, and returns only a fixed REVIEW metadata whitelist capped at **12** rows. Raw PriceCharting API JSON, seller/buyer identifiers and the secret token are never sent to browsers.
- Validated input, HTTPS PriceCharting product/offer URLs, allowed thumbnail domains, textContent-only browser construction (no seller-authored HTML), and 5-minute Cloudflare edge cache. Browser responses have \`cache-control: no-store\`.
- The global distributed D1 lease admits at most **one fresh public query per 30 seconds** across Workers; per-hashed-client bucket limits **four attempts per 15 minutes**. An uncached request within cooldown gets 429. Cached same-game requests bypass these limits. Rate records use SHA-256 hashes of client address and day, not raw IP, and expired buckets are periodically deleted by new accepted searches.
- New D1 migration: \`backend/migrations/0006_pricecharting_public_limits.sql\`.
- Fail closed if \`PRICECHARTING_PUBLIC_ENABLED\` is not \`"true"\`, private \`PRICECHARTING_TOKEN\` is missing, D1 is not configured, provider fails, or a request exceeds the limits.

## Deployment and testing

The existing manually dispatched \`.github/workflows/deploy-cloudflare.yml\` now requires the previously configured repository Actions \`PRICECHARTING_TOKEN\` secret. It provisions that secret in Cloudflare with \`wrangler secret put\` (without echoing it), then runs the usual Worker + static asset deploy and smoke. \`scripts/prepare-cloudflare.mjs\` enables only the independent public US PriceCharting route, keeping the saved-hunt \`MARKETPLACE_PROVIDER\` disabled and notifications disabled.

Before deploying, require GitHub **Validate GrailRaven app** and **Validate PriceCharting benchmark harness** green on current main. Then trigger the ordinary [Deploy app to Cloudflare](https://github.com/channel9ch9-source/retronomad/actions/workflows/deploy-cloudflare.yml) on main and verify green. Production smoke checks search UI JS, active Worker flag, and API input validation without consuming paid API calls. Then manually visit https://grailraven.com/search, select NTSC-U (US marketplace), look up a title with previously confirmed PriceCharting coverage such as **Tomba!** PS1, and verify actual REVIEW card/source URL/asking USD price or provider-specific 429/503 with honest status. Availability can change; a zero-result response is not proof of failure.

**No self-triggering production deployment** is introduced. Until owner runs manual deploy successfully, do not claim real PriceCharting data is available to current site visitors.

## Economic and deactivation controls

The owner purchased **one** Legendary month beginning 13 October 2026; expected renewal ~13 November subject to billing-account confirmation. Reminder scheduled for **10 November**. Renewal is not automatically authorised. If cancelling, set \`PRICECHARTING_PUBLIC_ENABLED:"false"\` in \`scripts/prepare-cloudflare.mjs\`, redeploy, delete the Cloudflare PriceCharting secret when no longer needed, and purge provider-derived cached/persisted licensed data according to PriceCharting terms (edge cache expires within 5 minutes; earlier benchmark ZIPs have expiration dates). Avoid repeated paid API calls simply for smoke testing.

## Known limitations

Marketplace offers are scarce for some collector targets, especially rare games. Additional gallery photographs visible on the PriceCharting website were not exposed by the previously tested offer-details API fields. PriceCharting provides title/category metadata, not independent proof of disc/edition. Result price is USD asking price only; no delivery cost or shipping eligibility; do not show GBP or calculated bargains. The pilot does not implement US edition verification, Japan support, broad multi-provider comparisons, or paid alerts.
