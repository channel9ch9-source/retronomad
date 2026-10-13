# PriceCharting US/Japan real benchmark — 13 October 2026

## Evidence and scope

- [GitHub Actions run 38446958623](https://github.com/channel9ch9-source/retronomad/actions/runs/38446958623) completed **successfully** (non-fixture, real authenticated PriceCharting API).
- Repo workflow: `.github/workflows/pricecharting-international-benchmark.yml`.
- Private temporary workflow artifact: `pricecharting-us-jp-small-benchmark`, id `11838860938`, expires 27 October 2026.
- 24 purposively selected international games: four PS1, four PS2, four Dreamcast for each of US (NTSC-U) and Japan (NTSC-J).
- Six additional console-category-wide queries for available Marketplace offers (US and Japanese PS1/PS2/Dreamcast).
- **0 provider errors.** No individual prices, listing IDs, seller information or private API credentials appear in the benchmark report.
- This small sample is **not representative** of the complete international library and has **no independent exact US/JP release barcode map**. Title+console candidates are NOT validated unique physical editions.

## Reference pricing — first-pass candidate coverage

| Region | Games sampled | Title+console candidates | At least one CIB price candidate | At least one loose candidate | At least one new/sealed candidate | Independently release-verified |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| US | 12 | **12** | **12** | **12** | **12** | **0** |
| JP | 12 | **12** | **12** | **12** | **12** | **0** |
| **Total** | **24** | **24** | **24** | **24** | **24** | **0** |

Names were filtered to the correct provider region-console namespaces and conservative normalized game title. Details were fetched for up to three candidates per game; current price-bucket presence was checked without retaining the price amounts. This establishes promising **first-pass availability** of reference data, not edition-safe market valuation, pricing accuracy, representative region-wide coverage, or licence value to paying GrailRaven users. Some candidate products have barcodes, but these were not independently matched against external US/JP release evidence.

## Marketplace — console-level API offers returned

| Region | PS1 offers returned | PS2 offers returned | Dreamcast offers returned | Total offers returned |
| --- | ---: | ---: | ---: | ---: |
| US | **30** | **30** | **30** | **90** |
| JP | **3** | **10** | **12** | **25** |
| **Combined** | **33** | **40** | **42** | **115** |

US distinct offered products represented in the first three responses: PS1 30, PS2 28, Dreamcast 27. Japanese distinct offered products: PS1 3, PS2 10, Dreamcast 12.

**Major caveat:** all three US console queries returned *exactly 30* offers, suspicious for a truncated/result-window limit. The official `/api/offers` documentation lists `sort=lowest-price|starts|name`, but does **not** document an `offset`/pagination or maximum count. A PriceCharting community answer refers to **30 most-recent** listings on a website listing page, but does not establish the API's exact cap. We therefore cannot say either that US inventory totals only 30 offers per console OR that the full pool is substantially larger. The correct statement is **at least 90 US API-visible offers across these three console requests**, possibly more behind a query cap. No UK/international shipping, availability outside supported buyer countries or exact edition verification was assessed.

For context: earlier PAL-console-wide run 38440168377 returned just **5 PAL PS1, 3 PAL PS2, 0 PAL Dreamcast** offers; earlier 100-game PAL pricing run 38428624620 found 88 PAL candidate-price targets but only 26 safe exact UPC/EAN matches.

## Interpretation and recommendation

The international pricing hypothesis is **meaningfully strengthened**: 24/24 chosen games have reference price candidates. This alone does **not** justify a recurring $49/month cost for a currently pre-revenue product, because accurate exact-edition matching, publicly useful workflows, acquisition/retention and willingness to pay remain unproven.

The US Marketplace looks more promising than PAL, but the exactly-30 pattern makes the total breadth unresolved. Japan returned 25 offers across three console categories with no independent shipping/edition checks. PriceCharting Marketplace is still not equivalent to eBay's wider active inventory. Continue to regard eBay Browse as an attractive future **authorised** discovery feed; eBay developer access is currently denied, do not circumvent.

**Next narrow diagnostic:** manually run `Check PriceCharting US offer result window`, which uses the existing GitHub secret and six further requests across two officially documented sort orders (`lowest-price` and `starts`) for the three US consoles. It outputs **aggregate-only counts and unique-overlap cardinalities**; no listing content. A union greater than 30 proves a single response is nonexhaustive (but not total stock or accessible pagination). Same union of 30 leaves limit vs actual supply unresolved. The workflow is manual/gated and the public provider remains disabled.

User purchased **one month** of Legendary; **no renewal is authorised**. Find real next billing date and prompt to cancel before renewal unless the user chooses otherwise. Raw PriceCharting API/CSV data must be purged on termination; this report includes only non-proprietary aggregate feasibility metrics.


## US Marketplace two-sort result-window diagnostic — 13 October 2026

The dedicated manual [GitHub Actions run 38448105573](https://github.com/channel9ch9-source/retronomad/actions/runs/38448105573) passed all regression, token-guard, API and aggregate artifact stages. Report artifact: `pricecharting-us-offer-result-window`, id `11838772853`, expiring 27 October 2026. The report is **aggregate-only**: private offer IDs, individual listings and prices were not exported.

The API was queried six times, comparing `sort=lowest-price` and `sort=starts` under `status=available` and each official US-console identifier.

| US console | Lowest-price available offers returned | Recent available offers returned | Offers in recent sort not in lowest-price sort | Distinct offer IDs across both | Proves single-response incompleteness? |
| --- | ---: | ---: | ---: | ---: | --- |
| PS1 / G6 | 30 | 30 | **30** | **60** | Yes |
| PS2 / G7 | 30 | 30 | **30** | **60** | Yes |
| Dreamcast / G16 | 30 | 30 | **3** | **33** | Yes |
| **All three consoles** | **90** | **90** | **63** | **153** | **All three** |

**What is proven:** Every US console's first 30-offer response was **not an exhaustive available-offer list**: comparing two supported sort orders found different eligible offers. The earlier international summary's 'US 90' is only a number *returned by its first three queries*, not the total marketplace inventory; this test directly identifies at least **153 different US offers across the three consoles** at query time.

**What is NOT proven:** We have not established actual total inventory counts, that 30 is an officially documented hard API response cap, completeness/pagination support, UK/JP buyer eligibility, international postage/delivered cost, or whether these offers match a meaningful proportion of collectors' exact release/edition criteria. A large share of offers may not be discoverable through a single broad console query. Use product-specific `/api/offers` as appropriate if later building a licensed integration, and confirm API retrieval semantics before promising comprehensive alerts.

**Business interpretation:** The previously reported **24/24** first-pass US+JP *title+console price candidates* and the now-proven **153 distinct US returned Marketplace offers** make PriceCharting internationally **more promising than initial PAL-only results implied**, but do not justify automatically renewing a $49/month subscription for a pre-revenue site. The US 24/24 sample was *not* independently edition/barcode verified. In the documented product design, PriceCharting is primarily a potential **reference-pricing layer**, while eBay (if authorisation later granted) or another compliant provider would be the stronger goal for broad live marketplace discovery. No public GrailRaven provider was enabled by any benchmark.

**Near-term action:** Stop further broad exploratory queries for now; focus on a scoped real product-use case and business need, or assess exact-release evidence for a few important US/JP games before contemplating public pricing claims. Confirm actual subscription renewal date and arrange cancellation before next monthly charge unless user explicitly decides it is justified. Licensed provider data must be handled/purged under PriceCharting's terms on subscription termination.
