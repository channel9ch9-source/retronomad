# IGDB daily Data Dump CSV — schema readiness gate

Prepared 14 October 2026. **The legal partnership agreement is pending; public promotion remains blocked.**

IGDB has enabled partner Data Dump access for the GrailRaven application's private ClientID. The older `Check IGDB Data Dumps` workflow already confirmed endpoint-list access; the enhanced workflow now **preflights required table schemas before committing to a CSV importer**.

## What to run

1. Open [Check IGDB Data Dumps](https://github.com/channel9ch9-source/retronomad/actions/workflows/igdb-data-dump-check.yml).
2. Choose **Run workflow → main → Run workflow**.
3. Confirm the job is green. Download the `igdb-data-dump-access` artifact and review `igdb-data-dump-access.json`.
4. Verify `metadataReady: true` and **SCHEMA_READY** for `games`, `release_dates`, `covers`, `alternative_names`. If it goes red, look at `missingFields` and schema status in its artifact. Do **not** enable production catalogue publication to work around a schema failure.

## What the workflow does

- Authenticates using existing private `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` GitHub Actions secrets (never asks user to paste them).
- Fetches `/v4/dumps` index and four per-endpoint `/v4/dumps/ENDPOINT` **metadata** responses, which report `schema_version`, `schema`, date and size.
- Checks for minimum structural columns:
  - games: `id`, `name`, `platforms`
  - release_dates: `id`, `game`, `platform`, `date`
  - covers: `id`, `game`, `image_id`
  - alternative_names: `id`, `game`, `name`
- Writes a small report with just field-presence statuses and endpoint timestamps. It **never saves or prints the five-minute presigned S3 CSV download URLs**, full provider data, credentials, or images.
- Automatically publishes the diagnostic report artifact even if a schema is missing. Missing required metadata or fields makes the workflow fail closed.

## What it does not do

- Download CSV or import games.
- Modify `catalogue/base-catalogue.json`, `catalogue-index.js` or production D1.
- Change the IGDB commercial approval repository variable or legal sign-off gates.
- Publish IGDB artwork or 8,433-game candidate to the public website.

The existing API-backed full-catalogue importer is already validated: 8,433 candidate game-platform rows and all 100 PALScout seed IDs preserved, with about 1.37 MiB browser search index in the October 6 promotion-pipeline dry run. That is a **separate prior result**. Data Dump readiness is not evidence that a CSV importer is implemented or that CSV row relationships exactly match live API response objects.

## Next engineering step after green preflight

Build a **private, fixture-tested CSV reader + relational join** that reconstructs relevant game, platform, alternative-name, cover and platform-specific release-date relationships from the CSV tables. Compare its output with the existing API-backed importer on a small fixed set of known games, then on full dry data if necessary and authorised. Verify field shape/schema version first. Do not blindly replace the proven API importer or download and publish a full partner dump in GitHub Actions artifacts.

Stop and review terms once IGDB sends its legal partnership agreement. Only after execution/authorization and explicit release-terms review may `IGDB_COMMERCIAL_APPROVED` be considered for promotion.
