# GrailRaven — Provider-independent matching accuracy hardening (17 November 2026)

Status: **Merged into `main` and validated; NOT manually deployed to Cloudflare.**

Purpose: improve the precision and conservative uncertainty handling of GrailRaven's browser and server shared matching logic, without new marketplace/IGDB/PriceCharting access or public-data changes. These improvements relate to the provider-independent core, not a claim that any seller listing is independently authenticated or that all source permissions are resolved.

## Delivered

1. **PR #2:** [Fail closed on unverified editions and missing delivered prices](https://github.com/channel9ch9-source/retronomad/pull/2) — squash merge `c86f77b`.
   - The PALScout default `Original / not flagged` is **absence of conflicting edition evidence**, not affirmative proof of an original pressing. Searches requiring an original or original/budget edition now return `REVIEW` for this default or unknown edition.
   - Explicitly labelled reproduction/replica/counterfeit/bootleg editions are excluded by the shared matcher. This is not a guarantee of authenticity against dishonest or ambiguous listings.
   - `null`, missing, blank, non-finite and negative delivered-price fields no longer become zero in price caps or Saved Hunt records/notification payloads. Positive/zero real amounts and existing eligible GBP total fallback still work.
   - New synthetic regressions in `tests/search-matcher-evidence.test.mjs`.
   - PR validation: [green](https://github.com/channel9ch9-source/retronomad/actions/runs/44136603723); first main validation after merge also [green](https://github.com/channel9ch9-source/retronomad/actions/runs/44136919965).

2. **PR #3:** [Prevent incomplete copies passing CIB checks](https://github.com/channel9ch9-source/retronomad/pull/3) — squash merge `d6234a2`.
   - Fixes the unsafe substring test where `"incomplete".includes("complete")` returned true, allowing contradictory descriptions like `incomplete`, `not complete` or `complete - missing disc 2` to satisfy a complete-in-box target.
   - Now negative/partial evidence is considered before positive completeness language. Preserve missing-manual acceptance where requested, but reject missing-manual copies for a CIB requirement.
   - Synthetic CIB/manual-optional/loose-allowed positive and contradiction tests were added to the existing matcher test file.
   - Corrected latest PR validation: [green](https://github.com/channel9ch9-source/retronomad/actions/runs/44137324660).

## Safety / deployment

- **No live Cloudflare deploy** was initiated. The deployment workflow is `workflow_dispatch` only; merging and validation do not publish these matcher changes to production.
- No provider credentials, IGDB licence flags, signed-contract status, D1 catalogue, artwork permission flags, partner feeds or subscription settings were altered.
- No new use of external content was introduced. Continue to follow [IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md](IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md) before deployment or licensing-sensitive features.
- Private synthetic tests demonstrate conditional behaviour, **not** verified seller provenance or validated full-production parity. Before deployment, inspect existing Search, Listing Checker and Saved Hunt UX for the increased number of REVIEW results, run full CI on current main, and manually check user-facing reason strings. Do not deploy without owner authorisation.

## Identified further accuracy work (not implemented)

- **Authenticity/evidence:** A seller's or metadata source's explicit "original"/"CIB"/"UK" wording is still not independent physical proof. Design a first-party visual/identifier evidence review gate before any `MATCH` claim implying verified physical copy. Avoid falsely upgrading marketplace offers.
- **Completeness:** Test and decide how `completeness=any` should treat explicit no-game/case-only offers; avoid calling these usable physical games simply because buyer allows any completeness.
- **Price semantics:** Validate on each approved partner adapter that `total` truly means delivered GBP including destination postage before allowing it as the fallback for a price ceiling. Do not assume listed USD price excludes/includes delivery.
- **Alias and edition signals:** Expand regression fixtures for misidentified sequels, cross-region versions, promo copies, reissues, non-original wording and ambiguous shared PAL serials.
- **Rights/availability:** Authorized retailer/eBay live inventory is still the primary commercial dependency. The above logic does not establish rights to use their data or prove a live listing is available.

**Next suggested task:** A bounded, offline synthetic benchmark of physical-copy evidence claims and deliberate false-positive cases, prioritizing no-game/case-only and contradictory supplier claims. Keep provider-independent and avoid production deploy until approved.
