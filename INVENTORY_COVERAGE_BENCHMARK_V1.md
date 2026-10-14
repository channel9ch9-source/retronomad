# GrailRaven — 20-search inventory coverage benchmark (v1)

Prepared 14 October 2026. **No provider has been measured against this list yet.** This is an agreed test *design*, not a result. Its goal is to establish whether each authorised inventory feed adds live **correct-copy** offers instead of just lots of vaguely matched catalogue products.

## Test discipline

- Test only actual product/listing records provided under valid retailer/API/feed permission and commercial display terms. No scraping, access-workarounds or republishing unlicensed photos.
- Fix the same 20 queries for each candidate feed; don't keep changing games to manufacture a better success rate. Search game title plus regional aliases where permitted.
- Count **distinct currently buyable physical offers**, not historical product database pages, sold items, waiting-list entries or other game recommendations.
- Show **MATCH** only with sufficient actual item-specific physical-release evidence. Use **REVIEW** if region, actual photographed edition, completeness, variant stock or condition is unverified. Use **FILTERED** if it is definitely the wrong region, platinum/GH, reproduction, loose, download or other exclusion.
- Treat photographs showing a generic stock image as no proof of exact physical edition. Do not assume supplied CIB fields verify the manual or case.
- Record item asking price and currency separately from destination-specific delivery and taxes. A local shipping quote is not a UK/US international delivered price.
- Record unique offer IDs and canonical URLs **privately as authorised** for de-duplication and freshness; avoid copying raw third-party seller details into a public repo. Public scorecards should only report aggregate counts.
- Wait for access, then run each feed on the same day or mark date/time differences explicitly.

## Fixed 20 collector search intents

| ID | Game to search / accepted regional alias | Platform | Desired physical market | Release / completeness to compare | Ambiguity to test |
|---|---|---|---|---|---|
| GR01 | Tomba! / Tombi! | PS1 | US NTSC-U | Original black-label, CIB | PAL Tombi! ≠ US Tomba!; disc-only filtered |
| GR02 | Tombi! / Tomba! | PS1 | UK-market PAL | Original UK retail, CIB | US NTSC-U and non-UK PAL not automatic MATCH |
| GR03 | Silent Hill | PS1 | UK-market PAL | Original black-label, CIB | Platinum and non-UK PAL require separation |
| GR04 | Silent Hill | PS1 | US NTSC-U | Original black-label, CIB | Greatest Hits/reproduction vs original |
| GR05 | Resident Evil 2 | PS1 | UK-market PAL | Original UK release, CIB | Dual-disc/manual and regional evidence |
| GR06 | Resident Evil 2 | PS1 | US NTSC-U | Original black-label, CIB | Greatest Hits vs original |
| GR07 | Suikoden II | PS1 | US NTSC-U | Original retail CIB | Rarity / exact disc and manual |
| GR08 | Parasite Eve | PS1 | US NTSC-U | Original retail CIB | US edition vs JP title variants / missing disc |
| GR09 | Project Zero II: Crimson Butterfly | PS2 | UK-market PAL | Original release, CIB | US title Fatal Frame II; UK vs other PAL |
| GR10 | Fatal Frame II: Crimson Butterfly | PS2 | US NTSC-U | Original retail CIB | UK title Project Zero II |
| GR11 | Forbidden Siren | PS2 | UK-market PAL | Original release, CIB | US name Siren; PAL region ambiguity |
| GR12 | Siren | PS2 | US NTSC-U | Original retail CIB | Forbidden Siren UK naming |
| GR13 | Haunting Ground | PS2 | UK-market PAL | Original UK retail, CIB | Region/edition, item-photo verification |
| GR14 | Rule of Rose | PS2 | US NTSC-U | Original retail CIB | High-value rarity and reproduction |
| GR15 | Silent Hill 2 | PS2 | UK-market PAL | Original UK retail, CIB | Special edition / Platinum separation |
| GR16 | Kuon | PS2 | US NTSC-U | Original retail CIB | High-value scarcity / completeness |
| GR17 | Jet Set Radio | Dreamcast | UK-market PAL | Original UK retail, CIB | US title Jet Grind Radio; region |
| GR18 | Jet Grind Radio | Dreamcast | US NTSC-U | Original retail CIB | UK title Jet Set Radio |
| GR19 | Illbleed | Dreamcast | US NTSC-U | Original retail CIB | Rarity / loose disc |
| GR20 | Shenmue II | Dreamcast | UK-market PAL | Original UK retail, CIB | Multi-disc set, missing disc, foreign PAL |

**Caution:** These are user buying targets, **not claims** about how IGDB or each retailer titles or categorises releases. Confirm exact release structures with existing PALScout evidence and qualified item attributes when evaluating results.

## One row per source / test query, fill only after licensed access

| Source | Test ID | Checked at (UTC) | Available distinct listings | CONFIRMED MATCH | REVIEW | FILTERED | Missing photo / stock photo | Price+currency provided | Buyer-specific delivery available | Notes / source restrictions |
|---|---|---|---|---|---|---|---|---|---|---|
| PriceCharting | GR01 | 2026-10-14 (public user test) | 1 | 0 | 1 | Not measured | Item thumbnail present, exact-edition proof missing | USD 134 displayed; price meaning under audit | No | Initial public search proves pipeline, **not full PriceCharting inventory or benchmark baseline** |
| Other rows | Pending authorisation | — | — | — | — | — | — | — | — | **UNTESTED; don't substitute zero for missing access** |

## Source-level decision sheet

Record:
1. Written right to display data, price/photographs, attribution and linkbacks on a commercial comparison website; permitted cache retention/refresh.
2. Coverage: count how many of 20 target searches have `>=1` in-stock candidate; separately how many have at least one evidence-supported exact COPY `MATCH`.
3. Additional **nonduplicate** relevant offers versus existing PriceCharting inventory and distinct regional markets covered.
4. Percent of records with useful per-copy region/release/completeness/condition data; actual-item photographs versus stock imagery; number requiring REVIEW.
5. Freshness: feed update interval, delist/quantity accuracy, stable IDs, gone-stock detection.
6. Economics: setup or monthly fee, referral commission, commercial-use conditions and costs per request.
7. Technical effort: usable CSV/XML/JSON/official API, integration effort, expected rate limits, API access and maintenance.
8. Falsification: test known traps — wrong territory, loose games, Greatest Hits/Platinum, reproduction manuals/cases — and penalise incorrect MATCH more than a missed opportunity.

**Gate to proceed:** supplier permission **and** verifiable incremental *in-stock original-game offers* on this test set (plus viable economics). A source with no item-specific condition/edition evidence can still contribute **REVIEW** inventory but must never be sold as perfect region filtering. Small special-interest retailers may add valuable unique stock without matching eBay-scale volumes; measure uniqueness and usefulness, not catalogue-size alone.

## Status

`BENCHMARK_TEMPLATE_PREPARED — NOT RUN — NO NEW LIVE DATA FEED ENABLED`.
