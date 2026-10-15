# IGDB private catalogue parity gate — 15 October 2026

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
