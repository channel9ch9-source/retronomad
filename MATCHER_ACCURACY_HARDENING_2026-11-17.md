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


## 17 November 2026 — physical-copy seller-claims gate and non-game exclusions (PR #4)

**Status: merged into `main`, NOT deployed.** [PR #4](https://github.com/channel9ch9-source/retronomad/pull/4) merged as `13a468a6f221338932251afefb91fed274c72729`. Synthetic regression and full app validation passed at [GitHub Actions run 44139039031](https://github.com/channel9ch9-source/retronomad/actions/runs/44139039031) (**168/168 tests**, build and syntax checks green).

- **Actual copy evidence remains unverified:** `shared/palscout-core.js` now marks its own listing classification with `physicalCopyEvidence: "SELLER_CLAIMS_UNVERIFIED"`, because extracting a serial, release-market, UK packaging description, CIB claim or photo claim from the listing and comparing it against reference material does **not** prove the seller's physical item. The shared matcher returns `REVIEW` for these PALScout results unless a hard contradiction yields `FILTERED`. This also prevents false MATCH alerts in the server monitor when using PALScout-only candidate details. `High` identifier recognition is not a first-party physical-copy certification. This does not guarantee all external data is true or that every manual classification passed into the matcher is authentic.
- **Non-game and empty-box protection:** Explicit `CASE_ONLY`, `MANUAL_ONLY`, `MAGAZINE_DEMO` and similarly marked non-game items are `FILTERED` even when a buyer chooses `completeness=any`. PALScout now detects more clear "no game"/"disc not included"/empty-box language. Loose playable discs remain eligible to be considered when the customer allows them, but still REVIEW without independent copy verification.
- **Missing disc specificity preserved:** PALScout now carries `missingGameDisc=true` when the listing explicitly says a game disc is missing, rather than losing this fact when normalising completeness to `incomplete`. The matcher filters explicit missing-disc items even for `completeness=any`; generic incomplete descriptions with no identified missing game disc stay REVIEW when any completeness is selected.
- **Testing:** `tests/physical-copy-evidence-guard.test.mjs` contains deliberately synthetic supplier claims, contradictory CIB/no-game details, item-only listings, missing discs, acceptable loose discs, and Saved Hunt gating. No provider calls, data import, catalogue mutation, subscription change, D1/Cloudflare modification or live publication took place.

**Important next engineering step:** Build a provider-independent **first-party physical-copy verification workflow** before any MATCH elevation. Decide what objective evidence is necessary (actual item photos of label/reverse/inserts, item-specific serial/EAN confirmation, mandatory condition/completeness checks), how it is manually reviewed, who records review outcomes, provenance, freshness and auditability, and how to prevent user/provider-controlled fields from granting themselves verified status. Until that is rigorously implemented and tested, treat supplier claims as REVIEW; do not 'temporarily' bypass the gate for commercial alerts. Also audit external partner-specific delivered-price field semantics before treating `total` as shipping-inclusive. No permission to sublicense IGDB, PriceCharting or marketplace records is implied.

**No deployment authorised:** code changes are committed to main, but the public grailraven.com site remains on the previous Cloudflare deployment until the owner requests one and predeployment/licence checks pass.
