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


## US Marketplace result-window comparison — 13 October 2026

[GitHub Actions run 38448105573](https://github.com/channel9ch9-source/retronomad/actions/runs/38448105573) finished successfully. Its temporary aggregate-only artifact `pricecharting-us-offer-result-window` (id `11838772853`, expires 27 October 2026) was downloaded and read. It compares six authenticated requests to `/api/offers`, all using `status=available`, split between three US console IDs and two documented sorts `lowest-price` and `starts`.

| US console | Cheapest-query offer rows | Recent-query offer rows | Different IDs in recent query | Distinct available IDs across both |
| --- | ---: | ---: | ---: | ---: |
| PS1 (G6) | 30 | 30 | 30 | **60** |
| PS2 (G7) | 30 | 30 | 30 | **60** |
| Dreamcast (G16) | 30 | 30 | 3 | **33** |
| **Total** | **90** | **90** | **63** | **153** |

**Interpretation:** all three console queries are demonstrably **partial result windows**: the distinct ID union across two supported sorts exceeds a single response's thirty rows. A returned count of 30 is not the entire market. PS1/PS2 sorted windows were completely disjoint; Dreamcast had 27 of 30 overlapping. Therefore **at least 153 distinct available US offers were observed** across these three console categories, not exactly 90. The true full offer count is **unknown** and may be substantially larger. This diagnostic does *not* establish API pagination, exhaustive search, or actual physical edition, seller/shipping eligibility, transaction quality or per-title coverage.

[Official API documentation](https://www.pricecharting.com/api-documentation) lists `status`, `console`, `id`, `genre`, `condition-id`, and sorts (`name`, `starts`, `lowest-price`) for `/api/offers`; it does **not** document offset/page/limit controls. A single console-wide query is therefore **not an exhaustive feed**. To build a credible user-facing Find-this-game experience, use product-ID-specific authorised requests and assess available offers for actual collector targets; do not extrapolate title coverage from console-wide counts.

**Business position:** US PriceCharting pricing presence remains promising (24/24 purposive US/JP targets have CIB/loose/new title+console candidates), but none of those physical release editions were independently verified, and the seller Marketplace is not yet validated as the full-size primary discovery engine. Do not automatically renew Legendary; first verify acquisition utility, exact releases, licence, and cost. Keep public provider off until proven viable. The one-month pilot remains within the user's budget limit.


## Game-specific US inventory feasibility — 13 October 2026

After discovering that general US console offers return limited 30-row windows, the user ran a **product-ID-specific** Marketplace pilot on 18 chosen US games/platform pairs, using up to four correct-console/exact-normalized-title PriceCharting product variants per title.

- [Successful real GitHub run 38451003997](https://github.com/channel9ch9-source/retronomad/actions/runs/38451003997)
- Private, counts-only artifact `pricecharting-us-game-offer-benchmark` id `11839844500`, expires 27 October 2026
- **18/18** have correct US-console game-title product candidates
- **13/18** had at least one available offer with a public offer URL, **28 such offers** across all 18 games
- **9/18** games had at least one offer whose provider completeness wording suggested CIB; **not independently verified**
- **0 provider errors**
- Segment split: **10/12 familiar games** with offers; **3/6 collector games** with offers
- PS1: **5/6 titles** with offers / **8 offers**
- PS2: **4/6 titles** with offers / **16 offers**
- Dreamcast: **4/6 titles** with offers / **4 offers**
- Rare collector targets with offers: *Tomba!* (PS1) 1, *Suikoden II* (PS1) 1, *Illbleed* (Dreamcast) 1
- Rare collector targets with no returned offers: *Rule of Rose* (PS2), *Haunting Ground* (PS2), *Cannon Spike* (Dreamcast)
- Also no returned offers for *Silent Hill* (PS1) and *Crazy Taxi* (Dreamcast) within checked variants

This 18-game convenience sample is **not representative** of complete US marketplace inventory; each game checked at most four title-consistent product variants. An available offer with URL, title and region-console metadata is only a *candidate*: **0/28** have passed an independent exact-edition/barcode/photo verification, delivery/shipping eligibility is unknown, and CIB wording is not proof of contents. No user-facing offer was activated. Licensed offer IDs, private tokens, prices and sellers were not committed.

### Business decision after the first three live benchmark rounds

There is real **supplemental** Marketplace utility in US queries, especially common titles, but 28 candidates over 18 games and weaker rare-title availability cannot yet justify committing GrailRaven to $49/month indefinitely, nor does this establish reliable matching/alerts. PriceCharting US+JP current-price references exist for 24/24 purposively selected games but still lack independent exact physical edition verification. eBay Browse could later provide wider authorised listing search if official developer access is eventually granted; rejected access remains parked and must never be bypassed.

**Next sensible product validation is not another raw volume count:** privately sample a few actual candidate listings for region/edition/completeness evidence, correct working links, eligible buyer destinations/postage, and what proportion can honestly be MATCH versus REVIEW. Build the minimum release-specific proof process without relaxing classifier rules. Check whether the previously approved (RetroNomad) public PriceCharting licence needs a GrailRaven name/international-scope confirmation before any live public deployment. Do not expose a token or enable the production provider in the meantime.

The user bought only the month starting **13 October 2026**, renewal likely around **13 November 2026** pending account confirmation; cancel before any second charge unless user explicitly consents. When the subscription ends, purge licensed API/CSV reports according to provider terms.


## Manual inspection of a real US offer: Tomba! PS1 — 13 October 2026

User examined one PriceCharting Marketplace listing in-browser (reported displayed total **$134**, including **$5** shipping; the scope/geography of shipping was not confirmed). Seller's description claimed "Item, Box, And Manual", condition "Normal Wear" and "Cib like new with manual". The individual offer page showed three photos and seller feedback. These are website observations **not established as all available through the PriceCharting API**.

An enlarged inside-case photo showed:
- Tomba! branded disc with clearly visible **NTSC U/C**, ESRB **E** and Sony title/product code **SCUS-94236**.
- Case holding disc and a visible printed booklet/paper insert on the left displaying a **Jersey Devil** advertisement. It could be an advert printed on the reverse of the Tomba! manual, but this photo does **not** establish the manual's cover/identity.
- Earlier front-cover photograph appeared North American and black-label rather than Greatest Hits, but edition evidence is not exhaustively checked.
- No independently confirmed playing-side condition, manual cover, unaltered original case/artwork, or buyer-location-specific delivery terms.

**Correct GrailRaven evidence assessment:** title/platform and US disc region strongly supported by photo; original release likely; **complete-in-box still REVIEW** until the front of the original Tomba! instruction booklet is visible, and condition/delivery suitability remain unknown. Do not assume PriceCharting API necessarily exposes all seller photos or seller descriptions merely because its website does. If a user target demands true CIB + North American original edition, overall verdict stays **REVIEW**, with explicit per-attribute evidence and reason codes. This exercise reinforces prioritizing offer-evidence quality and per-attribute confidence instead of overclaiming 28 exact US matches from the quantitative benchmark.

No photo or proprietary listing detail was committed to repository; this text is a qualitative outcome of user-provided visual inspection.


### Tomba! listing: matching original case/disc markings — follow-up photo review

Two additional user-supplied photos show (1) the back of the North American jewel case, with the standard US ESRB packaging and Tomba! rear cover, and (2) the front of its **black-label** case with **SCUS-94236** visibly printed on the cover/spine. The previously supplied disc photo visibly carries the same **SCUS-94236** identifier plus **NTSC U/C**. This strongly reinforces the title, US region, matching case/disc and apparent original black-label edition. Neither the disc back/playing surface nor buyer-specific postage terms was photographed/confirmed.

The closed-case front looks like a plausible manual-front cover. In the opened-case photo, the other side of the paper booklet/insert showed a Jersey Devil advertisement. On US PS1 jewel-case releases, the manual commonly doubles as the front cover, so this pairing provides **strong circumstantial evidence** of the seller's stated manual. It does **not conclusively prove a complete multi-page original manual**, which would require seeing the booklet outside the case or interior pages. Do not turn a plausible paper insert into a definitive CIB match without direct evidence.

GrailRaven classification for a strict **US NTSC-U original black-label CIB** target remains **REVIEW**, with high title/platform/US-region/original-edition confidence, strong-but-not-complete CIB evidence, and separately unknown disc-playing-side condition and buyer/shipping eligibility. Distinguish attribute-level confidence from overall strict-match readiness. This is a *manual human review of screenshots*, not an automated PriceCharting API listing classifier and not proof that API fields expose all three photographs.
