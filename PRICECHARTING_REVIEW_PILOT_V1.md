# Private PriceCharting REVIEW-first listing pilot v1

Created 13 October 2026. This is **private engineering validation**, NOT a live GrailRaven website feature.

## Business purpose

Demonstrate that the existing authorised PriceCharting Marketplace adapter can produce a candidate listing card for an actual **US** retro-game request while preserving GrailRaven's exact-copy integrity. This keeps the international GrailRaven parent product distinct from PALScout's UK/EU-specific classification.

Source files:
- `backend/pricecharting-review-pilot.js`: server-side US PS1/PS2/Dreamcast lookup, PriceCharting offer normalization, REVIEW evidence/reasons and safe HTML renderer
- `tests/pricecharting-review-pilot.test.mjs`: offline real-adapter-shape fixture tests, XSS defenses, safe provider URLs, US console separation, automatic-MATCH prohibition and privacy guards
- `scripts/pricecharting-review-preview.mjs`: synthetic HTML renderer and real-token **aggregate-only** smoke check
- `.github/workflows/pricecharting-review-pilot.yml`: manually dispatched workflow; requires existing PRICECHARTING_TOKEN Actions secret and PRICECHARTING_REAL_BENCHMARK=true gate.

## What the private pilot does

Accept a *US* game + one of PS1/PS2/Dreamcast and:
1. Search PriceCharting's authorised US console category for exact normalized title candidates (possible `[Greatest Hits]` variants are not claimed to be original).
2. Fetch up to **four** matching product records and their available offers using product ID and console.
3. Reject wrong title, wrong console, sold/ended/unavailable, missing valid item price, missing offer identifier or URLs that are not a safe `https://www.pricecharting.com/offer/...` link.
4. Normalize offer/item price and publicly usable listing metadata with existing PriceCharting adapter.
5. Return **REVIEW only** (never auto-MATCH). Reasons explicitly say US physical disc/cover region, exact edition, manual/completeness, condition and buyer-specific postage have *not* been independently verified.
6. Preserve USD **item price**, verified provenance attribution and a link back to PriceCharting. Leave postage, delivered GBP and delivered totals **null**; never infer a good-deal score from unverified exact releases.

PriceCharting API metadata cannot automatically verify the multi-photo physical edition used in the manual Tomba! QA. The offer-details endpoint may expose buyer PII for sold offers; this pilot **does not call it at all**.

## Output and data licensing safeguards

The source repository is **PUBLIC**. Its GitHub workflow publishes:
- a **SYNTHETIC ONLY** HTML preview that looks like a REVIEW result card; all game listing data in it is fabricated and explicitly labeled fixture.
- a separate **aggregate-only** live smoke-check summary for the same US Tomba! game. Only count flags (number of candidates, reviews, matching listing URLs/thumbnails/claims) are written. No real URLs, prices, photographs, UPCs, seller identities or raw provider payloads.

Real server-side candidates are constructed **in memory** only. There is no public Worker route, no browser-side PriceCharting token, no live UI results, no notifications, no Cloudflare secret, and no deployed PriceCharting feed. The fixture page contains no live data; do **not** mistake the workflow artifact for a real listing service.

## Commercial/public use gate

PriceCharting's earlier written public/commercial approval was originally granted to **RetroNomad** for the described launch uses with attribution and a Legendary subscription; GrailRaven is the current name and US/JP may be a material extension. Revisit provider confirmation before showing real licensed results to the public. Do not activate public PriceCharting until:
- the permission/name/global-use scope is confirmed where required;
- a server-side token is provisioned in the production environment;
- a secure, abuse-resistant server route is designed;
- exact-copy REVIEW/MATCH and evidence status is not misrepresented;
- user target/region and permitted cross-border buyer eligibility are validated;
- the one-month subscription renewal economics are explicitly approved.

The private pilot is deliberately *one implementation milestone* prior to a real production integration. Production currently remains dormant; a fixture screenshot does **not** prove real seller gallery access.

## Economic guard

One-month Legendary subscription began **13 October 2026**. Expected renewal about **13 November 2026** (verify exact billing date); a reminder is scheduled for **10 November 2026**. Do not continue a paid month automatically. Purge PriceCharting API/CSV data after the subscription ends, consistent with documented terms.
