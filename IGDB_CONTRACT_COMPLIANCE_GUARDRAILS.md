# GrailRaven — IGDB Contract Compliance Guardrails

Established: 22 October 2026
Priority: **CRITICAL / BLOCKING REQUIREMENT for any release or integration using IGDB-derived materials**
Status: Contract addendum received for signature; **execution/countersignature not independently confirmed** as of this record. Do not represent it as executed or claim blanket sublicensing authority.

## Purpose and owner direction

The owner explicitly requests **extreme care with compliance** because contractual liability and legal expenses from an avoidable mistake could cause severe financial harm while contracting as an individual. Treat this as a permanent risk-management requirement, not a one-time checklist. Prefer fewer features, slower publication and honest REVIEW states to uncertain data rights or unsupported legal assumptions.

Contractual basis: **IGDB API/Data Commercial Usage Addendum** provided via DocuSign (two pages), incorporated into the **Twitch Developer Services Agreement**. User's personal identity, document copy, account ClientID, envelope ID and signed paperwork **must not be committed** to this repository. Review the executed official agreement and then-current incorporated policies privately when changing operations.

## Non-negotiable licence constraints

1. **Permitted purpose only:** Use IGDB Services to provide end-user services in the named **GrailRaven** product. Commercial operation of that consumer product is expressly contemplated, subject to the Agreement/addendum and proper execution. This is **not** general permission to sell, sublicense, independently monetise, export in bulk to customers, or redistribute IGDB materials as an external data service.
2. **GrailRaven Intelligence:** Any future B2B/API/AI-assisted product must use a separately verified, rights-cleared evidence source and legal basis; a provider-independent software classifier alone does **not** cleanse IGDB-derived datasets or derived outputs. Seek specific written permission if supplying restricted IGDB data externally. Keep provider fields and provenance segregated.
3. **Attribution:** The checked attribution option in Section 4 requires mutually agreed reasonable IGDB credit, with the addendum's illustrative linked credit on **each relevant page/service using IGDB**. The current Cloudflare build script injects a linked IGDB credit onto `index.html`, `search.html`, `catalogue.html` and `about.html` when IGDB records are present. A source-HTML string search is insufficient: **inspect built output and live production** to verify visible, accessible attribution on all affected page types; identify any missing routes and confirm final wording/form with IGDB as needed. The presence of injection logic is not proof of compliance.
4. **Protect licensed material:** Review API/data dump use, caching, retention, image cover licences, local mirrors, data extracts, derived mappings, permitted displays and third-party data transfers separately. The addendum expressly identifies IGDB API v4; verify any additional permission or restrictions applying to data dumps, cover art and other rights-holders. Do not assume that a metadata licence automatically settles third-party copyrights in artwork.
5. **Client/account controls:** Use only the approved partner ClientID(s) and report authorised ClientID and technical-email changes to Twitch as the addendum requires. Never commit developer credentials, API secrets, personal contract identifiers, confidential source material or user information.
6. **Changes, expiration, termination:** Track the contract's execution date, one-year renewal / 30-day non-renewal window, and 30-day termination provision privately. If the licence status changes, pause new data ingestion and promptly review what uses may continue. Section 5 preserves certain uses of data collected before addendum termination **only while the underlying Twitch agreement remains in effect**, with continued applicable attribution. Underlying Twitch terms may have additional deletion/suspension obligations; do not assume indefinite storage or unrestricted resale.

## Mandatory release gate (before changes reaching users)

For EVERY IGDB-related code, dataset, metadata, artwork, API, export, AI integration, partner feed, monetisation or launch change:

- [ ] **Rights matrix:** Identify each upstream source (IGDB / PriceCharting / retailer / user-provided / independently authored), what fields/images are used, and explicit permissions for access, storage, display, caching, redistribution, commercial use and B2B use.
- [ ] **Purpose gate:** Confirm the actual feature still serves the permitted named end-user GrailRaven product, not independent IGDB-content monetisation or redistribution. Escalate uncertain new uses for written provider clarification before release.
- [ ] **Attribution gate:** Test the generated build and production pages showing IGDB material; confirm a visible clickable IGDB credit in each necessary location and relevant service. Automated build check where practicable.
- [ ] **Artwork gate:** Check source rights, attribution and the existing rights-status / feature-flag controls. Default to NO artwork if permission cannot be verified.
- [ ] **Evidence/trust gate:** Do not claim `MATCH` or exact-release verification from title/IGDB-only or seller claims; respect `REVIEW` where evidence is lacking.
- [ ] **Privacy/security gate:** Keep customer identifiers, personal data, sign-in tokens, uploads and private Saved Hunts away from external datasets/APIs; verify auth, origin, logging, retention and deletion behaviour for new functionality.
- [ ] **Operational gate:** Ensure the correct provider account, scope, plan, contract status and feature gates are used; no unlicensed scraping or policy bypass.
- [ ] **Document & test:** Note the permission evidence (without confidential details), run appropriate tests, manually inspect public pages and record any residual uncertainty before owner-approved deployment.

**Block a change** rather than guessing, when provider scope, permissions or attribution are unclear. Do not make a public data/feature change automatically on receipt of a contract or merely because a CI pipeline is green.

## Legal notices, takedowns and complaints — response procedure

**Do not assume everyone must first issue a warning.** In England and Wales many civil claims ordinarily involve pre-action correspondence, and cease-and-desist/takedown requests are common in IP disputes; nevertheless urgent injunctions, other jurisdictions, regulatory actions or direct proceedings can occur. The governing Twitch developer agreement contains California governing-law/venue language subject to applicable-law exceptions. Do not promise that advance notice is guaranteed, that removal waives earlier damages, or that conforming with a request settles any claim unless expressly agreed.

On any credible notice, request, takedown, allegation or regulator inquiry:

1. **Do not ignore or miss the deadline.** Preserve the original email/letter, time received, complained-of URL/asset, copies of terms and approval evidence, access logs where appropriate and relevant deployed code versions. Avoid changing or destroying evidence.
2. **Verify sender and allegations**, avoiding suspicious attachments/links. Identify the specific content/use and who claims rights.
3. **Contain potential ongoing harm promptly:** consider temporarily hiding or disabling disputed artwork, listings, data feed, API or feature while evaluating validity; preserve nonpublic records needed for a response. Do not automatically admit liability or assert wrongdoing.
4. **Seek proportionate advice and/or provider clarification:** If a formal legal demand, court paper or regulatory notice arrives, urgently seek free/low-cost legal assistance or professional counsel if possible; court deadlines are critical. Notify relevant licensors/insurers where contractually required.
5. **Respond calmly in writing** with precise facts; request evidence if unclear. Do not sign admissions, settlements, undertakings or releases you do not understand; Twitch's indemnification clause may require Twitch's written consent for settling a Claim involving it.
6. **Record resolution** and any confirmed written withdrawal/settlement; do not assume a takedown alone extinguishes accrued claims or costs.

Useful official references (for general information, not a guarantee of outcome):
- England/Wales practice direction on ordinary civil pre-action conduct: https://www.justice.gov.uk/courts/procedure-rules/civil/rules/pd_pre-action_conduct
- UK IPO guide for businesses accused of infringing IP rights: https://www.gov.uk/government/publications/ip-crime-and-enforcement-for-businesses/ip-crime-and-enforcement-for-businesses
- Twitch Developer Services Agreement: https://legal.twitch.com/en/legal/developer-agreement/

## Known implementation and pending compliance checks

- **Already implemented:** `scripts/build-cloudflare.mjs` generates IGDB linked credit on selected main pages; `shared/catalogue-core.js` and the catalogue build use rights-status controls for public artwork; public US PriceCharting offer cards are gated to REVIEW and source attribution; private feed intake checks upstream rights; users can view privacy/terms pages; backend has passwordless login and some protective controls.
- **Verify / improve when appropriate:** presence, prominence and full route coverage of IGDB credits **in built and live output**, especially pages consuming IGDB-backed catalogue indirectly; make attribution robust to new page additions; run an image/rights provenance audit before enabling more cover images; keep privacy/security review ongoing. These checks are not certifications or evidence of any proven violation.
- **Known risk:** Owner is contracting personally unless the legal party is changed with provider agreement, and the underlying Twitch Developer Services Agreement includes a broad third-party/government-body indemnification clause potentially covering certain legal fees. Compliance lowers risk but cannot guarantee no claims; legal risk is not eliminated by the expectation of a cease-and-desist warning.
- **Contract status:** Do not imply the addendum was fully signed/countersigned until the owner confirms and a completed agreement/certificate is available. Keep signed document and identity details in private storage, not this public repo.
- **Next step:** Review the exact proposed deployment against this checklist when substantive new functionality is ready; no app change, Cloudflare deployment or provider negotiation is authorised by creating this document.

**Standing rule: GrailRaven must never knowingly choose an unlicensed shortcut over its operator's financial security.**


## 23 October 2026 — IGDB legal team declines revisions and interpretation

**Owner-shared response from IGDB representative Christian:** IGDB/Twitch cannot amend its **standard commercial agreements** or provide a legal interpretation of the contractual indemnification wording. Christian acknowledges the Twitch Developer Services Agreement covers a broader set of Twitch services than the comparatively limited IGDB API use case. IGDB remains willing to proceed, but explicitly says the owner may decline the DocuSign request if they choose not to accept the standard terms. **No liability cap, contractual carve-out, indemnity waiver or formal risk estimate was offered.** The reply is not an assessment that GrailRaven itself violates the agreement or is safe from claims.

**State:** Owner has not confirmed signing or declining the DocuSign addendum; keep status **awaiting owner decision, NOT executed**. Do not mark executed, request another application or make live/public licensing changes automatically.

**Important existing-use dependency:** The 8,462-game public catalogue contains IGDB-backed metadata under earlier written go-ahead to proceed while final terms were prepared. The ordinary Twitch Developer Services Agreement says using Program Materials can bind a developer even before signing a separate addendum. Christian's “decline DocuSign and no further action needed” refers to the DocuSign signing process; **do not construe it as a written continuing licence to run a public commercial IGDB-backed catalogue indefinitely after declining**, nor as a release of obligations arising from existing use. If the owner decides to decline, review whether to pause further ingestion / remove or replace exposed IGDB-backed material, obtain unambiguous scope clarification if necessary and protect the owner's written keep-published preference through an explicitly agreed plan. Do not unilaterally roll back or modify D1/Cloudflare.

**Decision considerations:** The addendum's named GrailRaven end-user purpose, zero fee and attribution remain useful. Broad, not evidently capped individual indemnification remains a financial-risk tradeoff; no evidence of imminent claim or reliable probability exists. Comply with [IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md](IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md). If affordability precludes paying counsel, free small-business contract clinics may offer a short assessment; availability must be checked, and no clinic replaces a signed contractual cap.

**No change to live site, account configuration, rights-gates or deployments from this documentation update.**
