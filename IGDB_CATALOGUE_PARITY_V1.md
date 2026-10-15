# IGDB private catalogue parity gate — 15 October 2026

> **CRITICAL status correction (15 October 2026):** The full IGDB-backed canonical catalogue was already published on 12 October via [successful promotion run 38300719987](https://github.com/channel9ch9-source/retronomad/actions/runs/38300719987). Dataset `cat-455202e6a4daca830a8b`: **8,462 games** (PS1 3,727 / PS2 4,030 / Dreamcast 705), committed in `fc958b5`, activated in remote D1 and deployed to Cloudflare. [Successful production build/smoke 38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) deployed the same **8,462** on 14 October. Therefore older assertions that only 100 PALScout games are publicly served are **incorrect**. The 100 is the protected PALScout-deep subset. The promotion's `IGDB_COMMERCIAL_APPROVED=true` was observed **on 12 October only**; signed agreement and present flag state remain unverified. See [IGDB_PUBLICATION_AUDIT_2026-10-15.md](IGDB_PUBLICATION_AUDIT_2026-10-15.md). **No further public promotion or rollback without licensing assessment and explicit authorisation.**

**Status: implementation and fixture regressions added; a real same-run parity verdict is NOT yet available.** Do not confuse the successfully completed nine-table CSV relationship audit with CSV/API catalogue equivalence.

## Why the raw totals differ

The validated real Data Dumps contain 8,722 unique game identities attached to PlayStation, PlayStation 2 or Dreamcast. The 8,235 INCLUDE_CANDIDATE figure counts provider game identities across the three consoles, **before** grouping per platform and canonical name and before PALScout seed matching. The earlier API-based dry candidate had **8,433 canonical game/platform entries** (100 PALScout deep + 8,333 base-only). That 8,433 number is a historical benchmark, not a contemporaneous raw CSV total. Cross-platform reuse, the group-selection rules, held ambiguities, seed preservation and source-update timing all matter.

## What was added

- `shared/igdb-catalogue-parity.js`: aggregate-only reconciliation by `platform + IGDB game ID`; compares type eligibility, duplicate/colliding provider references, canonical title decisions (unique title or sole Main Game winner), PALScout seeds, all nine regional mappings, API base-only titles, aliases and platform release years. Any differences are flagged for review; the routine does not auto-accept a changed mapping.
- `tests/igdb-catalogue-parity.test.mjs`: synthetic tests for 100 deep seeds, nine mappings, shared cross-platform IGDB identity, canonical name suppression/ambiguity, mapping/title/year/alias drifts, and privacy of outputs.
- `scripts/igdb-private-real-dump-check.mjs`: optional additional `IGDB_PRIVATE_PARITY_CONFIRM` gate. After its previous nine-table CSV download/joins on a temporary runner, rebuild the *API candidate* privately via the existing API dry importer. Suppress that child's output because historic diagnostics can include game titles. Load candidate JSON locally, compare in memory, export only safe **numeric counts and check names**, and delete all temporary CSV and API catalogue/review data.
- [Private IGDB CSV/API parity](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-private-catalogue-parity.yml): explicit manual dispatch, dedicated job with regression tests, no production secrets beyond the existing IGDB credentials, no D1 or Cloudflare steps, seven-day aggregate-only artifact.

### Operator instructions

1. Confirm [Validate app CI](https://github.com/channel9ch9-source/retronomad/actions/workflows/validate-app.yml) is green on the latest `main`.
2. Open [Private IGDB CSV/API parity](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-private-catalogue-parity.yml), choose **Run workflow** on `main` once.
3. Inspect the uploaded `igdb-private-catalogue-parity-aggregate` artifact (JSON) or the sanitised console counts. Share **PARITY_PASS** or **REVIEW_REQUIRED** and aggregate counters only, not licensed titles, identifiers, download links, secrets or raw provider rows.
4. A red job can mean an actual parity discrepancy **or** credentials/download/API/rebuild failure. The safe artifact distinguishes `REVIEW_REQUIRED` from `RUN_FAILED_REVIEW_NEEDED`. Investigate without relaxing comparison checks and without publishing source records.
5. If review is needed, determine whether the discrepancy is due to per-platform provider filtering, deliberate seed/title ambiguity, release-year snapshot timing, or a real data/classifier problem. Do not replace the historical 8,433 candidate merely because a new snapshot count differs.

### Review categories

`checks` and `platforms` contain counts, not IDs. Specifically: PALScout seed identity and coverage, nine explicitly mapped aliases/titles and their provider references, CSV game-type exclusion, per-platform provider deduplication, selected CSV identities without a corresponding API catalogue record, API references absent from CSV, title/alias/year drift. The output is deliberately **diagnostic**: source snapshots may have changed between the daily dump and the live API and may need review. A failed parity check must not be treated as proof that either provider export is defective.

**Publication restrictions remain unchanged.** No `IGDB_COMMERCIAL_APPROVED=true`, provider imagery or full-catalogue promotion until the actual IGDB DocuSign agreement is received, reviewed and signed and permitted attribution/public-use terms are recorded. Public catalogue remains 100 PALScout launch games; this workflow cannot deploy, activate D1, expose CSV records or alter the public site.


## First real parity run and baseline correction — 15 October 2026

[First owner-run parity #38783788562](https://github.com/channel9ch9-source/retronomad/actions/runs/38783788562) was **REVIEW_REQUIRED**. Nine-table CSV relationship stage passed, synthetic tests passed, and the private API importer completed. Initial numeric observations: a regenerated API candidate of **8,488** records, 100 preserved PALScout identities, 9/9 explicit mappings correct, one API provider reference absent from CSV, five non-seed alias differences, four selected CSV records absent from API. These values **must be rerun under the corrected baseline** before judging source parity.

**Root cause of wildly inflated seed drift:** the 12 October repository file `catalogue/base-catalogue.json` is NOT merely the 100 launch seeds: the repository already includes thousands of BASE_ONLY canonical records from an earlier recorded promotion commit ([fc958b5d](https://github.com/channel9ch9-source/retronomad/commit/fc958b5dd1e4b223d0bfc938040cdb2fa5068855)). The first parity runner used the entire file as the API import seed, wrongly counting 8,362 BASE_ONLY records as changed PALScout seeds and retaining old candidates when computing new API coverage. This made 8,488 an apples-to-oranges API rebuild.

**Fix:** private runner now calls tested `selectPalScoutParitySeeds` to build its API dry-import input from exactly 100 PALSCOUT_DEEP entries. It temporarily substitutes that subset **inside the ephemeral runner only**, restores the full repository file in `finally`, deletes detailed outputs, and emits an aggregate comparison against the same-run CSV. A regression test supplies 8,362 synthetic historical BASE_ONLY rows and validates selection of only 100 deep identities. [Latest fixed-code validation #38784894662](https://github.com/channel9ch9-source/retronomad/actions/runs/38784894662) passed.

**Operator next:** manually rerun [Private IGDB CSV/API parity](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-private-catalogue-parity.yml) on current main. Review only aggregate counts. If still REVIEW_REQUIRED, investigate the per-platform discrepancies; do not weaken PALScout/identity guards or assume identical API-versus-daily-CSV snapshots.

**Separately:** reconcile handoff language asserting the full candidate was unpublished with the actual GitHub 12 October `Promote canonical catalogue` commit. Confirm what was deployed/served and what IGDB commercial rights are in force before any additional public promotion; this validation does not make those changes.


## Corrected parity run #2 — real discrepancies isolated, 15 October 2026

[Owner-run #38785556076](https://github.com/channel9ch9-source/retronomad/actions/runs/38785556076) **REVIEW_REQUIRED**. Its nine-table real CSV stage, API candidate rebuild from just 100 seeds and all fixture tests succeeded. Regenerated API candidate: **8,377 game/platform entries**, not 8,433 historical snapshot entries. CSV still 8,722 attached game identities, 8,235 preliminary INCLUDE_CANDIDATE identities, and cross-platform duplicates are handled separately. Corrected checks: 100/100 protected seeds, 9/9 curated mappings; zero changed seed identities, zero excluded source references, zero API base-title drift, zero platform-year drift. Outstanding: **1 API reference absent from CSV**, **502 API BASE_ONLY entries with CSV aliases not present in API candidate**, **115 CSV title-dedup winners not mapped to the API candidate**. These are different diagnostic categories, not proof that 502 physical copies or games are absent. The CSV daily snapshot and API requests are not guaranteed to reflect exactly the same update boundary.

A new private diagnostic extends `shared/igdb-catalogue-parity.js` to classify CSV-only vs API-only aliases (including counts and alias breadth), API report's held duplicate-title candidates, seed ambiguities, canonical ID collisions, and still-unexplained CSV selections. It consumes the existing **private** detailed `igdb-dry-import-review-YYYY-MM-DD.json` only on the ephemeral runner, aggregates numeric summaries and deletes the report; no row-level output. The new `shared/igdb-private-parity-recheck.js` privately queries only **unmatched IDs** through IGDB's legitimate live game API, reporting how many are still available with the same launch platform, switched platforms, or no longer returned. Those IDs are never persisted/printed/uploaded. All relevant tests are synthetic and do not relax the parity verdict.

**Next operator action:** once main CI passes, manually run [Private IGDB CSV/API parity](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-private-catalogue-parity.yml) one more time. Inspect aggregate `diagnostics.previousApiImport`, `diagnostics.missingSelectedCsvPair`, `diagnostics.aliases`, `diagnostics.liveApiByIdRecheck` and `platforms`. The job may remain red legitimately as a **review gate**, not a failed CSV parser. Use the new counts to decide whether to fix API paging/seed collision logic, explicitly hold ambiguous source rows, or accept documented snapshot differences *without* falsely calling them equivalent. Do not relax hard seed/mapping/identity controls.

No public catalogue promotion, D1 mutation, IGDB legal-approval toggle, provider artwork publication or Cloudflare deployment is part of this debugging.


## Third real private run — bounded reconciliation reached (15 October 2026)

Owner ran [private CSV/API parity #38790005402](https://github.com/channel9ch9-source/retronomad/actions/runs/38790005402). It produced `REVIEW_REQUIRED` because the **old gate demanded literal identity across different source snapshots**, even for explicitly held provider records. Import and regression steps passed.

New detailed evidence:
- API candidate generated solely from the 100 protected seeds: **8,377** canonical game/platform records.
- CSV: **8,722** relevant unique provider game records; **8,235** type-inclusion candidates BEFORE per-platform dedup and seed reconciliation.
- **100/100** seed identities and **9/9** curated mappings safe; **zero** platform-matched base title, release-year or real alias differences; **zero** referenced exclusions.
- **115** CSV selected (platform, provider game) identities absent from API candidate: **114 explicitly in existing seed-ambiguity hold events**, not accidentally dropped; **1** absent from the targeted live API lookup and therefore a *possible* daily snapshot boundary/deletion, **not conclusively proven**.
- **1** API candidate provider identity absent from the CSV: targeted live API confirms the same platform; this is consistent with a later addition/source snapshot mismatch.
- Full API platform attachment counts PS1 3,977 / PS2 4,313 / Dreamcast 741 versus CSV 3,977 / 4,314 / 740. The PS2 -1 and Dreamcast +1 account for the two small source mismatches.
- Earlier **502 alias differences were an overcount** from comparing against API canonical title while CSV alias normalization included redundant self-names; corrected comparison of normalized canonical title/aliases showed **zero** substantive differences.

### Carefully separated verdicts

Added `shared/igdb-parity-verdict.js` and synthetic negative tests:
- `PARITY_PASS`: actual exact identity/metadata parity and zero failed checks.
- `RECONCILED_WITH_REVIEW_HOLDS`: the only differences are explicit, still-excluded **seed ambiguity review holds** plus at most three tiny, directly checked same-platform API/dump snapshot gaps. The count breakdown must match the private targeted live API recheck exactly. This is **not exact parity** and **not publication approval**; source timing remains to be reviewed.
- `REVIEW_REQUIRED`: any unexplained omission, unexpectedly large snapshot delta, absent private review evidence, live API unavailable, different-platform record, unmatched source count, duplicate reference, title/year/alias drift, broken mapped seed or unsafe exclusion.

The ephemeral runner now emits an evidence-qualified `verdict`. A guarded **reconciled** verdict does not fail CI solely because it is not exact parity. Held candidates remain excluded and their identifiers never appear in artifacts. All regressions are synthetic and are automatically checked by normal CI.

**No repeat private full-data run is needed just to chase a green badge.** The 15 October run already supplies enough evidence to proceed with *private* catalogue engineering while retaining manual holds and commercial/legal publication gates. If source data changes or the IGDB signed contract introduces new terms, rerun the private benchmark then. Strict 100-seed and nine-mapping gates must always remain in place.

**Not verified/approved:** public IGDB catalogue promotion, pending DocuSign agreement, copyright/artwork rights, and historical 12 October GitHub full catalogue promotion versus older deployment claims. Keep production gates closed pending separate review.


## 15 October 2026 — actual public publication verified by Actions records

> **CRITICAL status correction (15 October 2026):** The full IGDB-backed canonical catalogue was already published on 12 October via [successful promotion run 38300719987](https://github.com/channel9ch9-source/retronomad/actions/runs/38300719987). Dataset `cat-455202e6a4daca830a8b`: **8,462 games** (PS1 3,727 / PS2 4,030 / Dreamcast 705), committed in `fc958b5`, activated in remote D1 and deployed to Cloudflare. [Successful production build/smoke 38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) deployed the same **8,462** on 14 October. Therefore older assertions that only 100 PALScout games are publicly served are **incorrect**. The 100 is the protected PALScout-deep subset. The promotion's `IGDB_COMMERCIAL_APPROVED=true` was observed **on 12 October only**; signed agreement and present flag state remain unverified. See [IGDB_PUBLICATION_AUDIT_2026-10-15.md](IGDB_PUBLICATION_AUDIT_2026-10-15.md). **No further public promotion or rollback without licensing assessment and explicit authorisation.**

**Next operational choice:** confirm the signed IGDB DocuSign agreement and current GitHub variable; if publication is not authorised, coordinate a 100-deep-only site/source/D1 recovery plan (there was no previous active D1 dataset in the activation log) and request approval before changing live services. Older sections are historical and are superseded by this audit.
