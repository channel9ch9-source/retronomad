# GrailRaven Inventory Provider Feasibility — 14 October 2026

## Why this investigation comes before additional coding

GrailRaven's first public US PS1 Tomba! lookup found **one** PriceCharting Marketplace offer, correctly displayed as REVIEW. One provider's limited live supply is not adequate proof of a valuable cross-marketplace paid search product. The priority is now to find a **second authorised source of genuine in-stock physical retro-game listings**, with item-level release evidence where possible.

This document records a **public-information desk review**, **not an integration agreement**, verified API access, complete stock count, or permission to crawl/scrape any retailer. No seller has been contacted from ChatGPT.

## Highest-priority prospective partners

### 1. Chillout Games / Retro-Games (UK; PAL / import focus) — investigate first for exact-edition data

- Official sites: https://www.chilloutgames.co.uk/ and https://www.retro-games.co.uk/
- Direct contact: the website's **Contact Form**: https://www.retro-games.co.uk/ (under Get in Touch); official business overview https://www.chilloutgames.co.uk/SellAbout.aspx
- Store states that **Retro-Games is owned by Chillout Ltd**, so these are one candidate business, **not two separate inventory feeds**.
- The retailer says it specializes in rare/collectible/import used games and its inventory pages describe individual copies with region, original/Platinum and other edition distinctions, completeness, disc/case/manual condition and item-specific photos. E.g. https://www.retro-games.co.uk/PS1/Command_and_Conquer_Sony_Playstation_One.aspx and https://www.retro-games.co.uk/PS1/reLoaded_Sony_Playstation_One.aspx .
- Its claims about tens of thousands of titles and historical photos are cataloguing claims, **not in-stock listings that can be imported**.
- **Access unknown:** no public authorised GrailRaven partner API/feed or commercial rights verified. Enquire about read-only inventory CSV/XML/JSON, affiliate/referral terms, hourly/daily stock refresh and permissions for displaying images/details.
- Potential exact-copy value: HIGH if its item-specific data is supplied. Stock volume, freshness, commercial availability, and fees unverified.

### 2. eStarland (US; NTSC-U / Japanese import candidates) — investigate in parallel

- Official store https://www.estarland.com/ ; pre-owned PS1 https://www.estarland.com/preowned/platforms/Playstation/34l ; official contact https://www.estarland.com/contact-us
- Active website category also includes PS2 and Dreamcast. Its PS1 pre-owned category displayed `Preowned - 1160 Items` when externally indexed; **not an independently audited current count** of distinct copies or exact releases.
- A specific US PS1 Tomba! product page publicly described **NTSC-U/C**, a **Used - No Box** variant listed around **$95.96** with `ONLY 1 LEFT` when indexed; this would be FILTERED for a user requesting complete-in-box, even though it is another possible source of US inventory. Link: https://www.estarland.com/product-description/Playstation/Tomba/7206 .
- Product page explicitly cautions that photos may be stock images and that shoppers seeking a particular version should contact the retailer. Hence item-level physical edition, photos and completeness may remain **REVIEW** or FILTERED even with access.
- Official business-development contact route is referenced from https://www.estarland.com/contact-us ; its site links to an Affiliate Program, but the presence and current feed/API rights are **not confirmed**. Wholesale page warns it is not accepting wholesale/dropship applications; we are seeking **comparison/referral inventory data**, not wholesale fulfilment.
- **Access unknown:** ask for legitimate product catalog feed, stock+variant availability, update interval, product picture licence, standard affiliate/referral terms, explicit price-comparison display permission.

## Secondary access routes

### Awin network — publisher product feeds, merchant selection needed

- Official feed overview https://help.awin.com/developers/docs/product-feed-publisher-guide-intro ; access instructions https://success.awin.com/articles/en_US/Knowledge/How-can-I-access-a-Product-Feed .
- Feeds include per-product name/description, price, imagery and product deep links; used by product comparison publishers. Access to particular advertiser feeds requires the relevant publisher relationship.
- Known gaming advertiser examples: Rarewaves https://ui.awin.com/merchant-profile/70042 ; ShopTo https://ui.awin.com/merchant-profile/2943 (states daily feed). **Neither has yet been shown to offer meaningful original used PS1/PS2/Dreamcast stock**. Do not claim general gaming feeds resolve our precise niche.
- Next action only if desirable: investigate publisher onboarding and whether any *approved* merchant feed contains original used physical stock; do not pay/signup purely because "gaming" appears as a category.

### Webgains network — alternative merchant-feed route

- Official docs https://knowledgehub.webgains.com/home/product-feeds-for-publishers .
- CSV/XML/TSV feeds available to publishers **joined to each programme**, also via platform API. No specialist retro inventory merchant verified yet.

### Etsy API — possible but lower priority

- https://developers.etsy.com/ ; personal app first, broader commercial access by application, comply with API terms and no scraping. Current original-game inventory versus reproductions not demonstrated.

### Shopify-based independent retailers — direct authorised partnership

- Shopify Storefront API docs https://shopify.dev/docs/api/storefront/latest . Can expose products/variants through a retailer-created token or approved access, but API documentation alone is **not permission to republish merchant listings**, nor proof stock items represent exact one-off original physical copies. Seek retailer consent and a feed/access arrangement.

## Source decision gates before software integration

For a candidate provider, require:
1. **Rights:** explicit permission to query/copy/display in-stock listing metadata, prices, seller-supplied photos, and deep links on a third-party commercial comparison site, and permission for a cache + refresh schedule.
2. **Coverage:** test ~20 mixed PAL and NTSC-U PS1/PS2/Dreamcast collector titles, noting distinct in-stock offers (not merely catalogue pages), region, edition, completeness, condition, country and shipping constraints. Distinguish stock variants from unique physical copies.
3. **Data:** per-item stable ID, canonical URL, current inventory state, updatedAt timestamp/refresh cadence, platform, region, release/variant, completeness, actual or stock photography flag, price+currency, delivery quote/eligibility and merchant attribution.
4. **Economics:** minimum monthly fee, rate limits, affiliate/referral share if any, cancellation, return on user interest; avoid paid contracts before a real sample shows useful inventory.
5. **Failure handling:** never turn a catalogue record into an available listing, stock image into exact-release proof, GBP into delivered price without shipment details, or a loose copy into CIB MATCH.

## Recommended immediate operational step

**Ask Chillout Games and eStarland for an inventory feed/affiliate or approved read-only product-data partnership.** These are the highest relevance found in this initial search, one UK and one US, rather than adding a generic digital-game affiliate catalogue.

Make an initial *short, low-pressure* inquiry via published business channels: 
> GrailRaven is a UK-based physical-game collector search and comparison site. We're looking for a legitimate read-only feed of your in-stock retro games to display alongside other authorised listings with direct links back to your store. Is an inventory API, CSV/XML/JSON feed or affiliate product feed available, and would third-party display of prices, item descriptions and photos be permitted? We especially need region, edition, completeness, condition and stock update information. We do not sell or fulfil products ourselves.

User has **not** authorised sending outreach automatically. Confirm wording/contact only when user asks.

## Strategic limits

- IGDB is game **catalogue metadata**, not in-stock retailer offers. IGDB legal agreement still pending.
- PriceCharting public US REVIEW adapter is live, but one Tomba! result does not show broad inventory depth.
- eBay developer registration was rejected after reconsideration. **Never bypass, scrape, impersonate an account, or claim approval**; possible honest future reapplication, not current dependency.
- No new recurring feed expenditures without a demonstrated pilot. PriceCharting Legendary single paid month started 13 Oct 2026, 10 Nov subscription decision reminder already scheduled; second paid month not authorised.

## Next state

**DESK_RESEARCH_COMPLETE / PARTNER_ACCESS_UNVERIFIED / NO_EMAILS_SENT / NO_FEEDS_ENABLED**.
Next after owner approval of outreach: contact first candidates, ask about allowed formats/commercial use, and benchmark only authorised sample responses. Continue IGDB paperwork in parallel. Do not expand UI merely to add unverified search links.


## Outreach status update — 14 October 2026

**User confirms BOTH initial enquiries were sent on 14 October 2026.** These are not draft/pending:
- **Chillout Games / Retro-Games** — request for a legitimate in-stock feed/API, item detail/region/condition/completeness, photo/data-use permission and commercial terms.
- **eStarland** — request routed through **Business development / wholesale / dropship / products distribution** contact, rather than Affiliate program inquiries, since the affiliate contact links to a registration form and the owner wanted pre-registration data-access clarification.

No response or permission yet; do not assert feed/API exists for either. Recommended non-pushy follow-up only if no answer after approximately **5–7 working days** (around 21–23 October 2026; business days depend on locality). Ask to forward to the correct team if necessary.

**Next task:** while waiting, shortlist additional high-relevance lawful retailer inventory feeds and prepare a concrete 20-game cross-region coverage benchmark, but don't start coding a new adapter without a permitted sample or documented API. Keep messages and partnership data private; do not put personal contact details/API credentials in repo.


## Second-round desktop shortlist — 14 October 2026 (no contact sent)

The most promising new partner identified is **RetroFix**, with two lower-confidence backups. These are opportunities to **ask for permission**, not licences, API entitlements or verified stock feeds.

### RetroFix / MyRetroFix — high-priority UK partner enquiry

- Official store: https://myretrofix.co.uk/ ; advertised partner programme: https://myretrofix.co.uk/partner/ ; email listed publicly: `info@myretrofix.co.uk`.
- Its own partner page offers free applications for **affiliate referrals** in a UK/US store network, and states no ongoing partner fee. **Crucial limitation:** its stated programme primarily addresses *other retro shops* and offers referral links; it does **not** promise machine-readable inventory or legal rights to republish price/photos on an independent aggregator like GrailRaven.
- Evidence-rich in-stock examples include **Re-Volt PAL Dreamcast, CIB** (https://myretrofix.co.uk/product/re-volt-pal-game-complete-in-box-for-sega-dreamcast/) with condition details, and **F355 Challenge Passione Rossa USA NTSC-U Dreamcast, CIB** (https://myretrofix.co.uk/product/f355-challenge-passione-rossa-usa-game-complete-in-box-for-sega-dreamcast/) with specific region/condition. A category page explicitly differentiates active and out-of-stock lines (https://myretrofix.co.uk/product-category/consoles/sega-dreamcast/).
- Preliminary significance: potential multi-region partner already storing item-level exact region, CIB, wear and in-stock quantity, with a direct business contact and partnership posture. Inventory feed/commission/display permission **must still be negotiated**. Product counts are dynamic and not confirmed authorised data volumes.
- Recommended next ask: *Can GrailRaven, as a price-comparison/referral website rather than a competing retailer, obtain a permitted read-only live stock CSV/XML/JSON or official WooCommerce/other authorised API, including photo and per-item edition information, with deep links and an agreed refresh cadence?*

### Lukie Games — US prospective source, access unknown

- Official individual product example https://www.lukiegames.com/Tomba-Sony-Playstation-Game.html shows a real US Tomba! product, with a **Game Only** buying option, listed price and in-stock text in the search snapshot. This is not a CIB offer and would be FILTERED under GR01 regardless of quantity.
- More evidence from https://www.lukiegames.com/Outrigger-Dreamcast-Game : stock and option-specific condition, region NTSC North America, platform.
- Data feed, affiliate rights and third-party redistribution rights not established. Do not retrieve item cards programmatically or assert a partnership.

### Retro Console Store — affiliate exists but data rights unverified

- Public https://retroconsolestore.com/index.php?route=affiliate%2Flogin advertises a free programme with product-level referral links and a listed **5% standard commission**. An affiliate system alone does **not** imply API/CSV access, useful original-game supply or photo display permission.
- Lower priority until verifying the real number of in-stock PS1/PS2/Dreamcast originals and ability to support exact-release evidence.

### Decision

**Ask RetroFix next** as third potential partner after Chillout Games and eStarland (already contacted by owner). No more generic retailer research is needed before doing this high-relevance enquiry and waiting for partner responses. Benchmark template: `INVENTORY_COVERAGE_BENCHMARK_V1.md`. No new API code or spending yet.

Research checked 14 Oct 2026 from official retailer sites; offers/prices and stock change continually.


## RetroFix outreach status — 14 October 2026

The owner confirmed **the third retailer partnership enquiry was sent to RetroFix / MyRetroFix** at the published contact email, `info@myretrofix.co.uk`. This requests an authorised read-only stock feed/API and permitted GrailRaven commercial display, as opposed to scraping or a generic affiliate link.

**Current outreach: 3 enquiries SENT, awaiting responses:** Chillout Games (UK), eStarland (US, via business-development contact), RetroFix / MyRetroFix (UK/international stock). No supplier has confirmed data rights, product feed access, fees, or technical feasibility yet. Avoid more redundant outreach until replies or an agreed next sourcing pass. Consider polite follow-up after roughly 5–7 working days where necessary. The 20-game coverage benchmark template is prepared but unrun.
