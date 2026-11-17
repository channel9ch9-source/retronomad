# GrailRaven — Independent physical-copy verification v1 design

**Status:** 17 November 2026 — offline architecture / review-checklist prototype only. No user-facing verification service, photo uploads, moderator accounts, production MATCH promotion, alerts or B2B API are enabled by this design. Do not deploy or claim verification is live.

**Purpose:** support GrailRaven's collector goal "Find the right copy. Know why it matches" with defensible evidence about the **actual physical copy** a seller offers, rather than relying on a catalogue game's metadata, a listing headline, AI interpretation, seller-entered fields or a valid serial alone.

## 1. Three different questions

1. **Game identity:** Is this title/platform from the catalogue? A title or IGDB record can help identify a game but cannot prove its physical edition.
2. **Release identity:** Which genuine platform/market/edition/packaging variant is this? Independently curated release evidence (serials, EANs where discriminative, cover/manual variants, known reissues) may support a candidate. Shared PAL serials and barcodes do **not** automatically establish unique UK origin.
3. **Individual item:** Does this particular seller offer that release, and does the pictured copy include the expected discs, manual, case/inserts in stated condition? This requires copy-specific evidence, source permission, item binding and a documented human decision. Photos can be outdated, copied, manipulated or not of the shipped item. Even an approved review is not an authenticity or delivery guarantee.

These are **separate gates**. Passing identity or reference lookup must never silently pass item-specific verification.

## 2. Proposed user-facing result language

- **FILTERED:** clear contradiction or unsuitable item (e.g. only a case, wrong platform, missing game disc, different territory when territory strict).
- **REVIEW:** possible fit but missing/conflicting evidence, seller assertions, missing usable photos, or unaudited/unapproved item. This is the default and does **not** trigger verified exact-copy alerts.
- **MATCH:** reserved for a future *authenticated, evidence-backed human-reviewed decision*, evaluated against a **specific collector target**. Do not use this label for auto-recognised seller photos, title-only matches, an IGDB record, catalogue evidence or a seller ticking "verified".
- **Verified item review** (future separate explanatory label): if implemented, explain exactly what was examined, when, by whom or which controlled reviewer role, and what remains unproven. Avoid "guaranteed genuine", "certified authentic" or "will arrive as pictured".

A generic listing cannot be globally MATCH for all buyers: an otherwise valid US/Platinum/loose copy may fail a collector's UK/original/CIB target.

## 3. Evidence checklist: item-specific photos, not just promises

For a **disc-based** PS1/PS2/Dreamcast prototype:

| View | Why it matters | Required when |
| --- | --- | --- |
| Front cover | Artwork, issue/edition clues | CIB or manual-optional |
| Back cover | Territories, languages, edition markings | CIB or manual-optional |
| Spine | Publisher/edition differences | CIB or manual-optional |
| Open case | Physical contents and disc arrangement | CIB or manual-optional |
| Identifier close-up | Serial/EAN/print details visible on actual object | CIB or manual-optional |
| Manual | Presence and language/print variant | CIB |
| Disc label **for every expected disc** | Game discs, disc numbering, surface identifiers | All targets |
| Disc reflective/data side **for every expected disc** | Visible damage or counterfeit indicators | All targets |
| Optional inserts, registration card, sleeve, seal evidence | Market/release-specific contents | Add when a curated release rule specifically requires them |

**Important:** this is a *minimum photo-submission checklist*, **not a verification algorithm**. A photo is not proof that the copy is authentic or in stock. The independent reference must establish **expected disc count and any edition-specific required items**. If that count is unknown, do not mark the evidence pack ready. Multi-disc titles require item-specific photographs of each disc. "Complete in box" requires checking the actual expected contents for that release; a generic checklist alone cannot prove it.

This first prototype allows "manual-optional" to omit manual views and "loose-ok"/"any" to omit packaging views, but still requires usable discs. A private reviewer can request additional evidence, challenge photos or other checks to resolve uncertainty. No stock photo, reused image or seller-supplied "actual photo" tag can be accepted as proof on its own.

## 4. Verification workflow: proposed human-in-the-loop process

**Stage A — rights and identity before acquiring photos**
1. Verify access and permitted storage/display of inventory details/photos for this exact provider and use. No scraping or assuming rights based on a marketplace link. A user-pasted listing can be inspected locally for private analysis, not harvested as licensed commercial inventory.
2. Bind a candidate to a **single immutable snapshot** of provider, listing ID, URL, listing version/time and destination-market context. Snapshot hash alone is not proof: a trusted backend must generate it from legitimately received content and store authorization/provenance privately.
3. Confirm a curated first-party release reference, including platform, supported territories, edition evidence, expected disc count and known ambiguous/shared identifiers; enforce field-level rights and keep IGDB/PriceCharting data separate from first-party observations.

**Stage B — untrusted evidence intake**
4. Collect legally usable item-specific views where permissions permit; any seller/user/retailer upload starts **UNVERIFIED**. Do not put photo files, customer content, contact details, raw links or private source credentials in the public GitHub repository.
5. Compute SHA-256 of actual ingested bytes on the trusted server; record photo role, disc number, upload identity, listing snapshot, permissions and time. Reused hashes across distinct required roles, unexplained extra disc numbers, stale listing snapshots and missing views produce an explicit review flag. These checks cannot detect all manipulated or stolen photos.
6. Run the offline checklist first. It returns **INVALID_PACKET**, **REFERENCE_REQUIRED**, **EVIDENCE_REQUIRED**, **CONFLICTING_EVIDENCE** or **EVIDENCE_PACK_ASSEMBLED**. The last status means only "enough labelled image slots exist to ask a reviewer"; it is NOT MATCH, verified or authentic.

**Stage C — trusted decision, NOT IMPLEMENTED**
7. An authenticated independent reviewer (not the seller/customer/provider's JSON) opens the permitted source snapshot and photos in a private review console. They manually compare title, platform, front/back/spine, disc face and etched/printed codes, packaging territory/edition, full expected contents, condition issues, suspected reproductions and seller-specific changes. In case of ambiguity, remain REVIEW or request more proof.
8. Record a structured decision *in a privileged server-only review ledger*, with reviewer ID, reference version, target criteria, evidence hash list, snapshot, timestamps, specific findings, reason codes and audit history. Require review permissions, CSRF/authz protections, server-side validation, immutable historical decisions, and independent audits of reversals. **Never trust a client payload containing `verified`, `reviewerApproved` or `MATCH`.**
9. Only a new backend policy could authorize a target-specific promotion after verifying **all** required checks, source rights, provenance, reviewer authorization and current listing status. It must not allow a provider adapter to force MATCH. **No such promotion function exists in v1**, by design.

**Stage D — expiry and corrections, NOT IMPLEMENTED**
10. Bind any later decision to the exact listing snapshot/version, reviewer-controlled record and permitted reference version. If stock/status, listing images, condition, asking price, contents, provenance, source permission or reference rules change, invalidate or re-review appropriately. Use short freshness windows; an operational review expiration is distinct from a seller's mutable stock claim. Allow correction/revocation, keep a private audit trail, and display the review timestamp/limitations.
11. Separate **potential listing found** notifications from future **verified exact-copy** notifications. A pending/reviewed candidate is not a guaranteed match. Avoid promising automatic verification of every new listing; manual review has capacity/cost limits.

## 5. Trust boundaries and threat model

**Untrusted:** seller titles, descriptions, "CIB"/"original"/"PAL UK" labels, image URLs, photo uploads and claimed photo timestamps, third-party AI/OCR guesses, client-provided hashes, submitted reviewer ID/approval, and partner flags. Data access does not imply authorization to republish images or resell data.

**Conditionally useful, not definitive:** catalogue record, known serial or EAN, marketplace platform/region tags, actual-item-looking photo, prior reviewer check of another copy of the same release. The physical item can differ even if metadata is accurate.

**Trusted only after a separate server-side process:** authentication of the reviewer/permissions, backend-calculated image and listing snapshot hashes, audited review record, first-party verified release rules with rights provenance. Even this supports a bounded professional assessment, not a lifetime authenticity or delivery guarantee.

**Failure modes to test later:** swapped photos, reused photo sets across sellers, counterfeit printing, missing second disc, replaced manual, French/German packaging sharing UK disc serials, "case only" hidden in details, seller stock change, price vs GBP delivered shipping, deleted listing, rights revocation, malicious file uploads, replayed approvals, conflicting reviewers and stale approvals.

**Privacy/security:** file allowlist, size/mime/content validation, EXIF stripping where lawful/useful, malware-scanning pipeline as appropriate, signed short-lived media access, private storage, access logging, retention/deletion schedule, minimal user data, abuse/rate limits and UK data-protection review before implementing uploads. Never promise the ability to verify photos automatically via AI.

## 6. Offline prototype committed now

- `shared/physical-copy-review-core.js` — **pure, metadata-only** checklist; no network, DOM, filesystem, upload, service worker, credentials, DB or image decoding. Does not modify existing PALScout/Matcher/monitor. No photo URLs or raw images.
- `tests/physical-copy-review-core.test.mjs` — synthetic, adversarial cases. Includes missing required views, exact expected disc counts, stale snapshots, reused hashes, malformed input, client spoofed "reviewed" flags, and non-disclosure of raw input fields.
- Every result has `verificationState: UNVERIFIED`, `canPromoteToMatch: false`, `canTriggerVerifiedAlert: false`, and `rightsReview: NOT_PERFORMED`, even when all image view slots are filled.

**No one has reviewed or verified any real item.** The prototype's expected disc counts and photo hashes are synthetic. Item-specific photo evidence must not be collected or deployed without reviewing applicable rights and handling user media safely. The 8,462-game public IGDB-backed catalogue, provider approval status, account/alert data and Cloudflare site remain unchanged.

## 7. Milestones and success metrics

1. **Now:** agree on evidence rubric and test the offline structural checker (this document).
2. **Next, privately:** create curated rights-cleared reference fixtures for a small representative set (one easy one-disc UK release, one shared-PAL ambiguity, one multi-disc release, one known reissue) and human-review **checklists**, with no licensor-controlled raw media.
3. **Then:** design privately authenticated reviewer console, ledger, secure image-storage lifecycles and signed provenance. No public upload without privacy/security assessment and explicit source rights.
4. **Pilot only with permission:** manually inspect a tiny authorised sample and compare the true-positive/false-positive review rates, median reviewer minutes per listing, evidence completeness, re-review burden and costs. Human-verification costs must be justified against collector demand.
5. **Eventually:** add target-specific authenticated approval and review-expiry state to the same provider-neutral domain model and test Search/Listing Checker/Saved Hunt parity, rights and incident rollback before even considering a live deployment.

**Blocking dependencies:** IGDB commercial signatory decision is pending; PriceCharting subscription status must be separately checked; eBay/retailer stock/image permissions are not confirmed. None of those sources grants blanket reuse or sublicensing permission. See `IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md` and `AI_DIFFERENTIATION_AND_DISTRIBUTION.md`.

**Standing rule:** fail closed, prefer REVIEW to unearned MATCH, and do not deploy, collect uploads or contact partners solely from this technical design without the owner's explicit decision.


## 17 November 2026 — offline reviewer-case records and invalidation workflow (PR #7)

**Status: merged into `main`, NOT deployed.** [PR #7](https://github.com/channel9ch9-source/retronomad/pull/7), squash commit `4fcced0edbdfdf9c49e15ac3a64f89195d1b5de2`. [GitHub Actions green](https://github.com/channel9ch9-source/retronomad/actions/runs/44154416846): **201/201 tests**, smoke-script syntax and Cloudflare asset build passed. Full technical and security design: [PHYSICAL_REVIEW_WORKFLOW_V1.md](PHYSICAL_REVIEW_WORKFLOW_V1.md).

- [x] Added `shared/physical-review-workflow-core.js`: **offline untrusted** versioned case-binding and ordered-event workflow prototype, covering evidence intake, human-review checklist sequencing, provisional findings, shared-PAL ambiguity, missing/conflicting evidence and terminal invalidation for listing/reference/evidence changes, permission withdrawal, unavailable item or revoked assessment.
- [x] Synthetic regression cases in `tests/physical-review-workflow-core.test.mjs`: complete and incomplete review, missing nine required checks, spoofed admin/reviewer approvals, attempted MATCH promotion, replay/duplicate/out-of-order or re-scoped events, rights revocation, and privacy-preserving summaries. These are *format/lifecycle checks*, not genuine authentication or tamper-evident audit records.
- [x] **No production verified MATCH path created.** Every case has `workflowAuthority: OFFLINE_UNTRUSTED_SIMULATION`, `verificationState: UNVERIFIED`, `canPromoteToMatch: false` and `canTriggerVerifiedAlert: false`, even when all checks show consistent. No new customer upload, authentication, image storage, D1 schema, partner/IGDB/PriceCharting access, provider rights flag, Cloudflare deployment or marketplace communication.
- [ ] **Next phase:** design a private authenticated server-side review ledger, strict reviewer authorization model, transactional/auditable persistence, photo-ingest rights/retention, and explicit evidence/reference freshness policy **before** implementing anything that could grant a genuine exact-copy verification. Prepare migration proposals offline only; do not apply them without owner approval and compliance/security review. The four PS1/PS2 reference fixtures remain public-web **research candidates**, not firsthand specimen-verified records.
