# GrailRaven — Release-reference research study v1 (17 November 2026)

**Status:** Offline, first-party-authored **research candidate fixtures**, not independently inspected specimen records. This work does NOT create verified exact-release records, seller-copy certificates, marketplace offers, authorised data reuse, live UI, alerts, B2B redistribution rights or licences. The intended future workflow is described in [PHYSICAL_COPY_VERIFICATION_V1.md](PHYSICAL_COPY_VERIFICATION_V1.md).

## Why these four games?

They exercise **four materially different collector decisions** using independently located *public reference webpages* rather than importing licensed IGDB/PriceCharting records or copying media. Each candidate has two or more human-readable source URLs saved alongside a minimal claim in `shared/physical-release-reference-study.js`.

| Case | Offline fixture | Research-based candidate reference | Collector trap / requirement |
| --- | --- | --- | --- |
| UK original with similar PAL discs | Vagrant Story (PS1) | UK packaging reportedly uses serial `SLES-02754`, EAN `4036636200459`, **one game disc** | Some Italy/Spain copies share serial `SLES-02754` and are catalogued with EAN `4036636200480`; **disc serial alone cannot certify UK market** |
| Shared PAL ambiguity | Silent Hill (PS1) | Serial `SLES-01514`, one disc, common original PAL EAN `4988602555660`; `2555660/A` is a documented UK/scandinavian-associated variant | `SLES-01514` and EAN are shared in other PAL regions. Even `2555660/A` is NOT unique country proof. Missing package/insert evidence keeps regional interpretation unresolved |
| Multi-disc original vs budget copy | Final Fantasy VII (PS1) | Original UK three game discs `SCES-00867`, `SCES-10867`, `SCES-20867`; original packaging barcode `0711719694328` | Platinum UK packaging is listed with barcode `0711719736820` while disc serials remain the same. **Three disc-label/data-side views plus edition-specific packaging are necessary** |
| Reissue / edition separation | Silent Hill 2: Director's Cut (PS2) | UK Platinum candidate: `SLES-51156`, package EAN `4012927022498`, printed code `7022498`, one game DVD | Original `Silent Hill 2` uses `SLES-50382` (and UK 2001 special edition has a Making Of DVD). Other countries use different packaging suffixes with the Director's Cut serial; a UK-specific claim needs packaging evidence |

### Research references and limitations

**Vagrant Story:** [PSX PAL Database 2000 entries](https://www.psxpaldb.com/years/2000/) distinguish a UK `SLES-02754` / `4036636200459` row from Italy/Spain `SLES-02754` / `4036636200480`. [PlayStation DataCenter](https://psxdatacenter.com/games/P/V/SLES-02754.html) corroborates PS1 serial and barcode but is not proof of a particular physical specimen. The reference's unique UK status remains *candidate* until independently photographed and reviewed.

**Silent Hill:** [PSX PAL Database](https://www.psxpaldb.com/games/silent-hill/) lists identical serial and EAN across several European countries. [Silent Hill Memories](https://www.silenthillmemories.net/sh1/versions_en.htm) documents both `2555660/A` and `2555660/B` packaging codes. [Lost Releases](https://crimson-ceremony.net/lostreleases/item.php?id=shgame_sh1-ps1-eur1) identifies the /A edition in UK and Scandinavia and says PAL disc material was shared. **Neither serial nor barcode nor /A alone proves a uniquely UK-manufactured copy.**

**Final Fantasy VII:** [PSX PAL Database](https://www.psxpaldb.com/games/final-fantasy-vii/) documents three-disc multiway jewel packaging and distinguishes original/Platinum barcodes for the UK; [GameFAQs release data](https://gamefaqs.gamespot.com/ps/197341-final-fantasy-vii/data) lists the three English PAL disc IDs and differing original/Platinum EANs. [SerialStation](https://serialstation.com/releases/18f46606-d38d-41a3-9538-b6562fcfb942) records shared serial identifiers across edition labels. This prototype checks *game discs only*; extra demos, inserts, registration cards or printing-specific manual details are NOT confirmed CIB content until a separately reviewed specimen rule has been authored.

**Silent Hill 2 Director's Cut:** [Silent Hill Memories versions](https://www.silenthillmemories.net/sh2/versions_en.htm) identifies the European Director's Cut Platinum `SLES-51156` and UK packaging suffix `7022498`, distinct from the 2001 original/special two-disc edition `SLES-50382`. [VGCollect](https://vgcollect.com/item/33688) reports UK director's cut EAN `4012927022498`. [PlayStation DataCenter](https://psxdatacenter.com/psx2/games2/SLES-51156.html) describes the director's cut game DVD. This does not establish the precise contents of every printing or guarantee authentic discs.

**Evidence provenance caveat:** These are third-party community/research pages that the project consulted to author a small set of factual test claims. Their accuracy, licensing scope and the existence/identity of a seller's item have not been independently audited. URLs are *research citations*, not permission to scrape, cache, republish imagery, ingest a provider feed or sublicense a dataset. Do not label these `APPROVED` or `VERIFIED` for production.

## What was built

- `shared/physical-release-reference-study.js` includes exactly four immutable, fixed, authored research candidates and their sources, expected game disc counts, edition/market caution, specific packaging barcode/code and known alternate identifiers.
- `inspectReleaseStudyObservations(referenceId, observations)` performs a **limited offline comparison of untrusted, supplied claims**, returning `REFERENCE_CONFLICT`, `REFERENCE_EVIDENCE_INCOMPLETE`, `SHARED_PAL_MARKET_REVIEW` or `RESEARCH_REFERENCE_CONSISTENT_UNVERIFIED`. An unrecognised reference or invalid input fails closed. It never verifies a physical item, its photos or its country and never produces a `MATCH`.
- `inspectReleaseStudyPacket(packet)` binds the existing offline photo-slot checklist to a **fixed authored disc count** from the reference, ignoring caller-provided `expectedDiscCount` and `gameId`. The result keeps release/reference review separate from submitted image-slot readiness; both remain **UNVERIFIED**.
- `tests/physical-release-reference-study.test.mjs` supplies synthetic observations and image-slot metadata. It checks missing FFVII discs, common SH1 PAL identifiers, alternate barcodes, Director's Cut/original conflict, spoofed client approvals, duplicate disc claims and that no sensitive seller input appears in outputs.
- No uploaded files, raw third-party photos, seller PII, API calls, inventory/IGDB imports, page integrations, rights flags, Cloudflare deployment, D1 mutation or future verified alerts were created.

## Remaining work before a REAL verification service

1. Privately examine **lawfully accessible physical specimens** or rights-cleared manufacturer packaging/manual data for each reference; record firsthand evidence, provenance, and uncertainty. A secondary website alone does not qualify as firsthand inspection or first-party verification.
2. Design and implement **versioned reference records with source/field provenance and human editorial acceptance** rather than static case studies. Track country-unique vs shared evidence, disc count, all required CIB inserts, possible print revisions and dated corrections. Unknown claims remain REVIEW.
3. Apply review rubric to safely handled **actual item images** under explicit permitted access/storage rights, alongside secure image hashing, private storage, retention/deletion, authentication and incident handling.
4. Implement a privileged, audited reviewer decision ledger before any target-specific promotion from REVIEW to MATCH, plus expiry/reverification on listing changes. Never accept a seller, AI or browser-supplied `verified` flag.
5. Test actual collector utility, authorized partner feed coverage, manual review cost and false-positive rate. The most pressing commercial blocker remains authorised current inventory.

**No-live-deployment rule:** Keep all four cases as offline research examples until source rights, specimen evidence, reviewer infrastructure and owner's explicit deployment decision are established. The IGDB contract/signatory decision remains unresolved.
