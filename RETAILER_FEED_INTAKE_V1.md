# GrailRaven — private retailer-feed intake v1

Status: **offline engineering readiness only**. Prepared while awaiting responses from Chillout Games, eStarland and RetroFix. **None has granted a working API/feed or publication rights** in this project record. Do not represent these synthetic tests as real inventory. This tool is not deployed, does not change the 8,462-game public catalogue, and has no network, Cloudflare, D1 or live supplier credentials.

## Objective

Before purchasing, connecting or displaying any second retailer feed, validate a small **partner-provided and explicitly permitted** CSV/JSON file against the immutable collector requirements in INVENTORY_COVERAGE_BENCHMARK_V1.md.

Code:
- shared/retailer-feed-benchmark.js: fixed GR01–GR20 requirements, CSV/JSON parsing, permission checks, normalisation, snapshot freshness, UK/US/edition/completeness safeguards and count-only report
- scripts/retailer-feed-benchmark.mjs: command-line entrypoint; **reads local files only**; emits fixed safe status codes, writes aggregate-only JSON with mode 0600 and will not overwrite a prior report
- tests/retailer-feed-benchmark.test.mjs: synthetic adversarial regressions, including title aliases, wrong region, reissues, loose/repro/manual-only, stock photo/CIB claims, stale stock, duplicates, unauthorised hosts, malicious provider text, invalid CSV and rights mismatch

## Access and licensing gate

Do not download a retailer's catalogue by scraping their website, copy product descriptions/images from listings, use an unauthorised feed link, or try to reverse-engineer a hidden API. Only begin when that retailer has supplied/authorised a file (or documented endpoint) **and** permitted private processing for GrailRaven's comparative coverage assessment. Check the exact rights: access, private processing, redistribution, photographs, prices, attribution, retention and affiliate/referral terms. Public use requires **separate explicit rights**; this intake never infers them.

A local rights JSON record must contain:
- provider: the same short provider label used by the mapping
- authorisationRef: a *local human-readable reference* (not a pasted private email, token or URL), at least 8 chars
- dataAccessAllowed: true **only if established by the real permission**
- privateBenchmarkAllowed: true **only if established by the real permission**
- allowedHosts: exact HTTPS partner listing domains; no wildcard or external host
- expiresAt: ISO UTC time at which this processing permission expires (must be after the current runtime date)
- publicDisplayAllowed and photoDisplayAllowed may be recorded as false; this tool does not elevate them to true

The permission record is an operator attestation, **not** automated verification that the person granting permission had legal authority. No signed agreement? Do not manufacture positive permissions to make the tool run. Retain the signed email/licence separately and verify scope manually. Store the rights record under private-retailer-feeds/, which is gitignored.

## Input configuration

Create a mapping JSON (private-retailer-feeds/partner-mapping.json) of the form:

    {
      "provider": "Partner Example",
      "columns": {
        "listingId": "sku",
        "game": "game_name",
        "title": "item_name",
        "url": "product_url",
        "platform": "platform",
        "market": "market",
        "edition": "edition",
        "completeness": "included_items",
        "itemType": "item_type",
        "status": "stock_status",
        "updatedAt": "last_update",
        "currency": "currency",
        "itemPrice": "listed_price",
        "deliveryPrice": "destination_postage",
        "quantity": "stock_qty",
        "photoType": "photo_origin"
      }
    }

The eleven core mappings listingId/game/title/url/platform/market/edition/completeness/itemType/status/updatedAt are mandatory. Optional mapped columns include currency/itemPrice/deliveryPrice/quantity/photoType/condition. The example field names are **hypothetical**, not claims about any contacted retailer's schema.

The tool supports a UTF-8 CSV with quoted commas and embedded newlines, JSON arrays, or a JSON object whose "items" is an array. Hard limit 5 MB and 5,000 records per intake; no remote URLs as inputs. **The input's game field must explicitly identify a game**, rather than inferring the intended game from a long seller listing title. If partner schemas do not offer a game field, first design a separate evidence-reviewed mapping step; do not silently fuzzy-match. The code still rejects a clearly contradictory longer known game title. Platform accepted values: PS1/PlayStation/PSX, PS2/PlayStation 2, Dreamcast/Sega Dreamcast. Regions: UK, US/NTSC-U, European PAL, Japanese NTSC-J. Unknown regions stay REVIEW, not UK-approved. Accepted stock state must explicitly say "available" or "in_stock"/"in stock"; sold, preorder and unstocked are excluded. Last-updated must be present and within 168 hours by default; future timestamps beyond five minutes are not accepted as fresh.

Local commands, *only once an authorised sample and rights record arrive*:

    node scripts/retailer-feed-benchmark.mjs --feed=private-retailer-feeds/stock.csv --mapping=private-retailer-feeds/mapping.json --rights=private-retailer-feeds/rights.json --out=private-retailer-reports/trial-2026.json

Use a **new** output file each time; outputs are never overwritten. Do not commit, upload as an Actions artifact, or paste vendor rows, product IDs, private auth links or contract attachments into public issues or repository documentation.

## Meaning of an evaluation

- **In-stock candidates**: distinct listing identifiers with valid HTTPS URL on an allowed partner host, explicitly in stock, fresh snapshot, game/platform matching one of the fixed targets. These can still be wrong-region, wrong-edition, incomplete or unsafe for buyers.
- **FILTERED**: evidence explicitly conflicts with desired country, release, contents, physical game type or a clearly contradictory known game name. US stock is not UK PAL; European PAL is not automatically an exact UK item. **Never claim to have verified any manual/disc/case**.
- **REVIEW**: no demonstrated hard conflict, but supplier's original-release/CIB/region description or "actual photo" designation is **not independent proof** of exact physical copy, condition or customer-specific shipping. Even apparently strong supplier claims remain REVIEW until later separate per-copy verification. A lack of evidence never becomes an exact MATCH.
- **MATCH**: always zero in v1. Future copy-by-copy review needs separate traceable documentary evidence and regressions before any upgrade.
- **Unique potential listings**: deduplicated *within this one supplied partner file* across search intents. Does not claim uniqueness versus PriceCharting (source-to-source overlap cannot be determined until lawful IDs/links are compared privately).
- **Prices/delivery**: listed price and postage tracked separately; the script never fabricates GBP conversion, seller shipping eligibility or delivered totals. Zero price/unknown postage stays a caveat.
- **Unmatched/missing listings**: zero candidates from one partner sample does NOT mean no such stock exists or no other marketplace can supply it.

Output has only the fixed target names and aggregate counts; it does not include raw item details, URLs, stock codes, seller names, licence references, prices or API tokens. Its "permissionCheck" field says the references are not independently verified. CLI failure logs only fixed error codes to avoid exposing partner content.

## When a retailer responds

1. Read the actual terms; check whether private feed access, client-side/public metadata display, item photography, referral linkbacks and cache windows are permitted. If access is refused or terms unclear, **stop**; no scraping fallback.
2. Confirm actual feed schema and update the local mapping without injecting vendor-specific field names into shared logic.
3. Process a **small permissioned sample in private** and review only aggregate GR01–GR20 outcomes. Compare freshness, correctly classified potential copies, wrong-region and edition traps, photo evidence and delivered-price uncertainty. Do not mistake copied stock photos for live item photos.
4. Check economics and freshness updates/delist behaviour. Evaluate whether it adds *new, reliable, current* UK/PAL or US offers beyond the sparse PriceCharting pilot.
5. Only after rights, coverage and source safety are demonstrated: design a server-side adapter, securely hosted private feed fetch and refreshed inventory layer **behind a new explicit activation flag**. Separate implementation and launch approvals.

Current plan: wait for retailer replies; **no new paid subscription, network import or public activation**. The IGDB catalogue and existing PriceCharting REVIEW service are untouched.


## 16 October 2026 — verified end-to-end with deliberately fictional inputs

- [End-to-end test and green GitHub CI 38945239126](https://github.com/channel9ch9-source/retronomad/actions/runs/38945239126) ran the **real offline CLI** twice, once for fully synthetic CSV and once for equivalent JSON. It generated temporary local rights/mapping files with clearly fictional retailer identity and domains, then checked that both aggregate results agreed.
- New `tests/retailer-feed-cli-e2e.test.mjs` verifies all 20 intents, predictable review/filtered examples, sold/stale/duplicate/bad URL safeguards, aggregate-only output, no fake supplier URLs/IDs/price/permission text in report or stdout, report not overwritten and private file permissions. Temporary fixture files are deleted.
- The optional CLI argument `--synthetic-fixture=true` is **for test data only** and causes report `fixture:true`. **Do not use it on genuine licensed retailer records**, for which the default report `fixture:false` applies. The flag does not bypass permission checks.
- The `tests/public-build.test.mjs` check and `scripts/build-cloudflare.mjs` exclude `shared/retailer-feed-benchmark.js` from public Cloudflare assets. The CLI and tests are never exposed as public webpages.
- This green outcome proves software behaviour on a **manufactured sample**, not actual stock, agreement rights, true partner coverage or public launch readiness.

**External status as of 16 October:** The owner has received no replies yet from Chillout Games, eStarland or RetroFix. Their initial enquiries are recent; wait until next week to consider one polite follow-up rather than contacting them immediately.
