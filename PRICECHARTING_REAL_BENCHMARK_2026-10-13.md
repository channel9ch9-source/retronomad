# PriceCharting Real Benchmark — 13 October 2026

## Scope and evidence

First authorised, paid-token benchmark completed in GitHub Actions:
- run: https://github.com/channel9ch9-source/retronomad/actions/runs/38428624620
- conclusion: **success**
- mode: **both** (pricing and Marketplace offers)
- fixture: **false**
- network access: **true**
- targets: the **100** pinned PALScout-deep game/platform pairs (PS1 40 / PS2 40 / Dreamcast 20)
- both jobs and the report-upload step succeeded
- original reports: private downloadable *workflow artifact* `pricecharting-real-benchmark` (artifact 11829794444, expires 12 November 2026)

The raw reports contain **licensed provider pricing and offer data**. They are intentionally **not** committed to this public repository. This note contains aggregate counts and an engineering/business interpretation only. Comply with provider cache/data deletion obligations if the subscription ends.

## Pricing result

| Measurement | Result |
| --- | ---: |
| PAL-specific title/pricing candidates | 88 / 100 targets |
| Safe exact UPC/EAN matches | 26 / 100 |
| PAL title candidates but no safe identifier match | 62 / 100 |
| PAL search results rejected by strict title matcher | 9 / 100 |
| Exact UPC/EAN response conflicts with strict title matcher | 3 / 100 |
| At least one candidate CIB reference price | 88 / 100 |
| At least one candidate loose reference price | 87 / 100 |
| At least one candidate new/sealed reference price | 88 / 100 |

Breakdown:
- PS1: 11 exact identifier matches, 25 title candidates, 4 strict-title rejections
- PS2: 11 exact matches, 23 title candidates, 3 strict-title rejections, 3 strict-title conflicts
- Dreamcast: 4 exact matches, 14 title candidates, 2 strict-title rejections
- Of 72 targets with a PALScout evidence barcode, 43 UPC lookups produced `pricecharting_request_failed`. A missing/error UPC lookup is **not** evidence the unrelated title result represents the exact physical edition.
- The three title conflicts include superficial spelling/punctuation/variant-name differences in PriceCharting response titles; investigate carefully without silently relaxing the release-evidence threshold.

**Caution:** 88 candidate-price targets is **not** 88 fully verified exact-copy references. Release and edition matching must be reviewed before any public pricing conclusions. Do not publish reference prices by title alone.

## Marketplace-offer result

- 100 / 100 targets returned a completed benchmark row; **0 provider-error rows**
- Games with one or more available offers: **3 / 100**
- Available offers across those targets: **3 total**
- Platform of these offers: **PS1 only**; PS2 = 0, Dreamcast = 0
- For the broad PAL-compatible hunt: 3 PALScout evaluation results were `MATCH`
- For the stricter UK-exact hunt: all 3 were `FILTERED`; **0 UK-exact matches**
- Delivered GBP, shipping/postage and UK seller suitability were **not** established
- The broad hunt did not require CIB or a delivered-price ceiling, so the 3-offer result is not simply caused by an over-restrictive CIB or price filter

**Caution:** This is inventory for the chosen **100 high-interest benchmark targets via the present exact-title/product matcher**, not a claim that only three PAL listings exist across all of PriceCharting. Title matching limitations and overall Marketplace breadth should be checked before a final provider verdict.

## Business interpretation

Reference pricing coverage looks potentially useful, but exact-release confidence is much lower than candidate counts suggest. PriceCharting Marketplace is **not validated** as a meaningful primary live UK/PAL inventory source for GrailRaven at this stage: only three offers across 100 representative games and no verified UK-exact results, versus the project's provisional strong coverage threshold of forty games with relevant offers.

Given the user's explicit one-month cost ceiling, **do not allow this result alone to justify renewing a $49/month subscription**. Before next billing:
1. verify overall PAL marketplace availability/adapter limitations with a small scoped diagnostic, rather than purchasing or engineering a costly integration;
2. investigate the few title/UPC normalization cases without weakening UK/PAL release safety;
3. identify other authorised live-inventory strategies (eBay developer access still rejected; do not scrape or evade limits);
4. assess whether the pricing layer alone is worth funding when acquisition/retention are unproven;
5. decide on cancellation before the renewal date; respect PriceCharting's post-subscription data purge terms.

The website's public PriceCharting integration remains disabled, artwork remains disabled, and no user-facing real-data coverage claims should be made yet.
