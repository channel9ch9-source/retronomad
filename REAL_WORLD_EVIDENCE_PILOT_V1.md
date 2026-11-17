# GrailRaven — first real-world physical-photo evidence validation pilot (17 November 2026)

**Status:** First **manual source-photo review completed**, with an offline, reference-only evidence reasoning fixture and adversarial tests. **Not** a real seller-item verification pilot, rights approval for third-party game artwork, functional image analyser, byte-ingest pipeline, authenticated reviewer verdict or live product. **No original photo bytes are stored in this repository.**

## Question

Can the current GrailRaven evidence framework distinguish *things actually visible on real photographs* from conclusions that a source caption, seller, barcode or photo alone cannot establish?

**Short answer:** A small manually reviewed, explicitly source-linked public-photo sample demonstrates clear cases where GrailRaven must remain conservative: a case spine can state a disc count without showing its discs; a black disc reverse can be labelled FFVII in a Wikimedia caption without revealing any disc number; a visibly cracked real PS2 disc is useful condition reference material but is not bound to any current seller; and a case illustration with paper props must not be mistaken for a genuine game/manual.

The test validates **claim boundaries and source provenance**, *not* independent accuracy or authenticity of a marketplace copy. We still have **zero** seller-bound, consented/rights-cleared multi-view sets; it would be dishonest to report a sensitivity, precision, authenticity rate or production MATCH count.

## Method

1. Searched for actual physical-game photographs with a stated, inspectable individual-file copyright licence; excluded generic marketplaces, eBay seller photos, stock imagery and game cover scans without separate rights assessment.
2. Opened the **exact Wikimedia Commons file description**, creator, license section and a page revision, **not** the sitewide CC0 metadata footer. Recorded the photographer's stated licence and link. As uploader claims, these are still not a legal opinion or confirmation of rights to **underlying game packaging artwork**.
3. Inspected the rendered photographs visually, without OCR or generative reconstruction. Recorded only direct visual features; separated those from the photographer's **caption/description** and from unsupported claims.
4. Attempted to acquire original file bytes in the working environment, but downloads were unavailable. **No image was ingested, no trusted SHA-256 was computed, no EXIF was independently verified, no private media rights workflow was run.** The external image pages remain links only.
5. Encoded five real photographed source pages, authors, licences, manual observations, and unsupported conclusions in the immutable offline fixture `prototypes/real-evidence-pilot/public-photo-evidence.js`. Tests assert that none can promote a seller listing to verified MATCH or an exact-copy Saved Hunt alert. Existing PALScout/monitor production logic is **unchanged**.

### Source-by-source inspection

| Public source and creator | Photographer's license stated on file page | Actually observable / source context | **Not established** / pilot outcome |
| --- | --- | --- | --- |
| [Final Fantasy VII–IX case spines](https://commons.wikimedia.org/wiki/File:Final_Fantasy_VII-IX_game_cases_1.JPG) — **BrokenSphere**, [specific revision](https://commons.wikimedia.org/w/index.php?title=File:Final_Fantasy_VII-IX_game_cases_1.JPG&oldid=1139807776) | CC BY-SA 3.0 | Several distinct actual PlayStation jewel cases, printed titles and a *three-discs* marking on an FFVII case | No actual discs photographed; does not prove presence of all FFVII discs, UK PAL EAN/edition, complete manual, or one sale-ready item. A photo of several cases is **not** one CIB listing |
| [Black PlayStation disc data side, captioned FFVII sample](https://commons.wikimedia.org/wiki/File:CD-ROM_for_PlayStation.jpg) — **PiaCarrot**, [specific revision](https://commons.wikimedia.org/w/index.php?title=File:CD-ROM_for_PlayStation.jpg&oldid=1105527312) | CC BY-SA 3.0 (among selectable licences) | Dark disc reverse; the **source caption** describes the disc as an FFVII sample | No title/region/serial/disc 1/2/3 label on pictured side. Do **not** use the page's FFVII description as visual proof of that title or combine it with BrokenSphere's unrelated cases |
| [Disc Crack From Case](https://commons.wikimedia.org/wiki/File:Disc_Crack_From_Case.jpg) — **CRTGAMER**, [specific revision](https://commons.wikimedia.org/w/index.php?title=File:Disc_Crack_From_Case.jpg&oldid=1206287988) | Public-domain self dedication | A visibly cracked optical disc near its hub, shown on a PS2 case | Not an identifier for a particular game or seller. Strong example of **visible condition** but not proof of playability or a defect in anyone else's listed copy |
| [PS2dvd](https://commons.wikimedia.org/wiki/File:PS2dvd.jpg) — **DiscoverYellow**, [specific revision](https://commons.wikimedia.org/w/index.php?title=File:PS2dvd.jpg&oldid=1200434552) | CC BY-SA 3.0 | Reflective PlayStation 2 optical disc underside, PS2 marks | Not a readable game-title/disc serial, UK territory determination, authenticity guarantee or current seller-item provenance |
| [PlayStation 2 Game Case - Inside](https://commons.wikimedia.org/wiki/File:PlayStation_2_Game_Case_-_Inside.jpg) — **Aya19790**, [specific revision](https://commons.wikimedia.org/w/index.php?title=File:PlayStation_2_Game_Case_-_Inside.jpg&oldid=1239133046) | CC BY-SA 4.0 | Real plastic case; pieces of paper marked "Game Manual" and "Game Disk" | **Deliberate negative control:** neither paper prop is an actual game disc or genuine game manual. Illustrative layout **must not** satisfy CIB checks |

**Licence nuance:** These pages label the *photographs* CC BY-SA or public domain. CC BY-SA permits redistribution (including commercially) subject to licence conditions such as credit, link and relevant ShareAlike obligations for adaptations. Whether every *separately copyrighted* video-game artwork on the pictured cases can be redistributed in a commercial GrailRaven interface is **not independently cleared** by this study. We currently **link to source pages, do not import or rehost media**. Credit and source/author details are preserved even for public-domain images for provenance.

## Findings / small sample metrics

| Measure | Result | Interpretation |
| --- | --- | --- |
| Public photo pages visually inspected and source terms checked | **5** | Real external photographs, not fictional metadata or an image-recognition dataset |
| Photos showing real disc or case objects | **4** | Some show only a reverse/packaging, not the required complete view set |
| Deliberate paper-prop negative control | **1** | Prevents a false completeness-positive even with a real plastic case |
| FFVII-associated pages | **2** | Different people/objects; **must not** be merged into a fabricated single FFVII copy |
| File-page licence statement recorded | **5 of 5** | Not blanket commercial rights to all underlying depictions |
| Original image bytes stored in project, SHA256s computed | **0 / 0** | Source-link audit only; not image-ingestion validation |
| Cases bound to one authorised, currently offered seller item | **0** | **No live physical-copy verification accuracy rate can be measured** |
| Eligible verified MATCH or exact-copy alerts | **0** | Correctly conservative, **not** evidence of a functioning verification product |

## Offline implementation

- `prototypes/real-evidence-pilot/public-photo-evidence.js` records the five individual photographic sources with **manual visual observations**, photographer, revision and licence and an explicit unsupported-claim list. The module never fetches images, processes pixels, rewrites the production catalogue or trusts seller claims.
- `assessRealPhotoPilotSource(id, {releaseId})` returns either `PUBLIC_PHOTO_LIMITED_EVIDENCE` or `ILLUSTRATION_NOT_SPECIMEN`, always **UNVERIFIED**, always requiring seller binding, legal/rights checks, actual image-byte provenance and more evidence.
- `assessRealPhotoPilotBundle(sourceIds, {releaseId})` disallows merging unrelated photographers' photos into one valid seller copy: returns `UNBOUND_PUBLIC_PHOTO_SET` for known sources even if a mock collection appears to have multiple photo types.
- `tests/real-photo-evidence-pilot.test.mjs` checks exactly these negative inferences; it cannot independently retest visual correctness because source media is **linked, not vendored**. Real visual observations were recorded by human inspection, **not** automatically proven by test code.

**No third-party source reclassification, rights grant, image publication, marketplace feed, IGDB licence state, D1 migration, real uploader account, cloud deployment, site mutation, or notification path is added.**

## Critical gap and honest next experiment

To validate the actual GrailRaven promise—*identify the exact physical copy being sold*—we need **a coherent, item-bound, rights-cleared photo set of the SAME physical copy** (ideally an item owned by a consenting participant or your own copy) and a known independent reference for that particular edition. Before any permanent upload or public display, confirm scope of consent, rights, storage and retention. Keep personal/seller identifiers private.

**Recommended first true pilot:** one personally owned PS1 or PS2 game with explicit permission for **private analysis**, photographed directly by the owner, showing:

- The same object together with a dated case-specific paper identifier (helps bind views; not cryptographic provenance).
- Front, back and spine of the case; the clearly legible barcode, print/reissue and region markings.
- Open case, manual if claimed complete, inserts required by the researched release, and **label/data sides of each game disc**; legible printed disc serials and disc numbering.
- Photos sufficient to inspect scratches/damage, with each view separately identified. Do not include receipts with addresses, account numbers, order IDs or other private details.
- A separate written reference/evidence sheet for expected discs, packaging/inserts and edition ambiguity, independently cross-checked without assuming community-catalogue entries are first-party proof.

Run PALScout/reference/packet comparison as a **review exercise**; record what remains UNKNOWN, what a manual reviewer can corroborate, and whether the same-item photo binder holds up under mixed-source/edited-photo adversarial trials. Never say "authenticated" merely because a photo has a timestamp or a code matches a catalogue.

**Go/no-go checkpoint:** only after several authorised real-item sets and independent reviewer decisions, measure coverage, contradiction detection, manual review time and false positives on known counterexamples. If evidence acquisition and review hours become too costly, GrailRaven may need to position this as **transparent evidence grading** rather than comprehensive human authentication of all marketplace listings. This aligns product value with realistic throughput.

### Compliance / no-deploy

See [IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md](IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md). Photos from copyrighted packaging may have separate rights; the CC metadata footer on Commons is **not** the file image licence. Keep current work private/offline, never represent the four research release references as independently specimen authenticated, and do not publish or redistribute third-party source images based on this research alone.
