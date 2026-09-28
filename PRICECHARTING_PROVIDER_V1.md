# PriceCharting Provider v1

Last updated: 29 September 2026

This document records the first server-side PriceCharting integration scaffold for RetroNomad.

## Status

Implemented against the documented PriceCharting API contract without a real subscription token.

Files:
- `backend/pricecharting-provider.js`
- `tests/pricecharting-provider.test.mjs`

The adapter is **not enabled in the public Worker yet** and no claim is made about real API coverage or Marketplace inventory depth.

## Permission basis

The commercial/public-use approval is recorded in `PRICECHARTING_APPROVAL.md`.

Until RetroNomad reaches the documented revenue threshold in that approval record, the intended production access path is the PriceCharting Legendary subscription with PriceCharting attribution. The private API token must remain server-side only.

## Launch platform mapping

The adapter uses PriceCharting's dedicated PAL console namespaces:
- PS1 -> `PAL Playstation` / `G72`
- PS2 -> `PAL Playstation 2` / `G63`
- Dreamcast -> `PAL Sega Dreamcast` / `G65`

A result from the US or Japanese console namespace is not accepted merely because its title matches.

## API paths used by the scaffold

- `/api/products?q=...` for candidate discovery
- `/api/product?id=...` for product detail / UPC enrichment
- `/api/product?upc=...` for exact identifier lookup support
- `/api/offers?status=available&id=...` for available Marketplace offers

The client:
- keeps the token out of returned data and error messages
- throttles calls to remain below the documented normal API rate
- caches product lookups briefly
- caches offer requests for at least five minutes inside the Worker isolate to avoid repeated same-URL calls

A persistent cache can be added later if real traffic justifies it.

## Matching boundary

The PriceCharting adapter is an evidence provider, not the release classifier.

Candidate product discovery requires:
- the exact expected PAL console namespace
- the same normalized game title after removing only a trailing bracket/parenthetical provider variant label

This deliberately prevents broad fuzzy title matching such as `Resident Evil` -> `Resident Evil 2`.

Provider variants such as Platinum/reissue records may still be returned. They are not silently accepted as the requested edition. PALScout and the shared matcher remain responsible for edition/release/completeness decisions.

When a product detail exposes a UPC/EAN, that identifier is passed to PALScout so RetroNomad's own release evidence can decide whether it proves an exact or shared PAL release.

## Marketplace normalization

PriceCharting offers are converted to RetroNomad's normalised marketplace-listing contract.

Preserved evidence includes:
- PriceCharting offer ID and canonical offer URL
- product title
- PAL console namespace
- UPC/EAN from product detail when available
- include/completeness wording
- condition wording
- PriceCharting product ID
- PriceCharting product attribution URL
- current offer price

PriceCharting offer prices are retained as **USD**.

The adapter does **not** fabricate:
- postage
- delivered total
- delivered GBP
- English-language packaging evidence
- UK-specific release identity

A Saved Hunt with a delivered-GBP ceiling therefore remains REVIEW until RetroNomad has a source-backed way to establish the delivered GBP amount for the offer.

## Reference pricing helper

The provider module contains a small mapping helper for PriceCharting product fields:
- CIB -> `cib-price`
- Loose -> `loose-price`
- New/sealed -> `new-price`
- Box/case only -> `box-only-price`
- Manual only -> `manual-only-price`

Incomplete/condition-specific copies do not receive an automatic reference bucket from this helper.

This helper does not by itself make a product match release-safe. Exact release matching must happen first.

## Fixture QA

Initial fixture suite: **6/6 passed** on 29 September 2026.

Covered cases:
- PAL launch console IDs
- rejection of same-title NTSC product rows
- rejection of a different game in the same PAL console namespace
- acceptance of provider variant records as evidence rather than silently changing the target edition
- UPC/EAN preservation
- CIB condition filtering
- integer-cents to USD conversion
- no invented postage / delivered GBP
- completeness evidence normalization
- safe missing-token failure

These are contract/logic tests only. They are not a real PriceCharting coverage benchmark.

## Next steps

1. Add user-visible PriceCharting attribution support to the future result/pricing UI.
2. Keep the Worker marketplace provider disabled until real validation is ready.
3. When the adapter and attribution path are ready, purchase the approved Legendary subscription.
4. Store the token only as a Cloudflare Worker secret.
5. Run the 100-title UK/PAL release-safe **pricing** benchmark.
6. Run a separate 100-title PriceCharting Marketplace **offer coverage** benchmark.
7. Measure exact identifier/product-ID matching, PAL safety, completeness mapping, live offer volume and practical UK usefulness.
8. Only then decide whether to wire PriceCharting into the public Deal Finder / scheduled Saved Hunt monitor.
9. Do not assume PriceCharting Marketplace replaces eBay unless measured coverage supports that conclusion.
