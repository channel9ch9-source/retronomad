# GrailRaven IGDB publication status audit — 15 October 2026

## Outcome: previous "only 100 games public" handoff statements are false

This audit is based on authoritative **successful GitHub Actions job logs** and repository file/workflow inspection. An independent direct HTTP fetch of the current production domain was not available during this session. However, the **14 October production smoke test did fetch and pass against grailraven.com** after a build that included 8,462 titles. The practical deployment risk is therefore real, not merely a speculative repo-file discrepancy.

### 12 October actual remote promotion

- [Manual promotion workflow run 38300719987](https://github.com/channel9ch9-source/retronomad/actions/runs/38300719987) started 12 Oct 2026, 19:54 UTC, completed **success** at 20:00 UTC; job `promote` executed (not skipped).
- Logs explicitly show `IGDB_COMMERCIAL_APPROVED: true` and `CATALOGUE_PROMOTION_CONFIRM: PROMOTE_IGDB_CATALOGUE` **for that run**. **Present value of the GitHub Actions variable not independently accessible.** These CI flag values are not evidence that a legal agreement was signed.
- Validated and remotely staged dataset `cat-455202e6a4daca830a8b` with **8,462 game rows** and 8,462 external references.
- [Generated commit fc958b5](https://github.com/channel9ch9-source/retronomad/commit/fc958b5dd1e4b223d0bfc938040cdb2fa5068855) changed `catalogue/base-catalogue.json` and `catalogue-index.js` to **8,462** games: PS1 **3,727**, PS2 **4,030**, Dreamcast **705**. This is the main-branch canonical catalogue today, not a private-only candidate.
- D1 dataset was activated successfully at 20:00:29 UTC; activation result records `previousDatasetId: null`. **There is no previously active dataset evidenced for one-click pointer rollback.**
- Workflow built static assets from the full promoted catalogue (`Built compact catalogue search index with 8462 games`) and successfully deployed the Cloudflare Worker `retronomad-app`.

### Subsequent production deployment

- [14 October Cloudflare deployment run 38585003573](https://github.com/channel9ch9-source/retronomad/actions/runs/38585003573) completed **success**; build logs again show **8,462-game public static index** followed by successful Cloudflare deployment. Its production smoke script ran against `https://grailraven.com` and reported success.
- Other 14 October deployment [38579823383](https://github.com/channel9ch9-source/retronomad/actions/runs/38579823383) also passed.
- Main repository is **public** (`visibility: public`, `has_pages: true`). The source catalogue and 1.4 MB `catalogue-index.js` are therefore publicly accessible from GitHub even if the production domain were rolled back. Git history also retains them.
- `scripts/build-cloudflare.mjs` directly uses `catalogue/base-catalogue.json` for `dist/public/catalogue-index.js`. `catalogue.html` and `search.html` load the index directly. The production 8,462 game index is not gated by the IGDB legal flag during ordinary `Deploy app to Cloudflare` runs.
- `.github/workflows/promote-approved-catalogue.yml` checks the repository variable and typed confirmation, but **ordinary** `.github/workflows/deploy-cloudflare.yml` does not check agreement execution. Thus future routine deployments can keep serving the 8,462 records regardless of the current variable.

### Unverified and not to assert

- The user's most recent stated IGDB status was **waiting for the IGDB/DocuSign legal agreement**. Do not claim a signed agreement or commercial publication rights based merely on an API-partner email or a GitHub Actions flag.
- Direct current-time GET to `grailraven.com` was unavailable in this audit; 14 October live smoke evidence plus deployment history is the most recent directly supported production evidence.
- Current GitHub repository variable `IGDB_COMMERCIAL_APPROVED`, actual current D1 active pointer after the October promotion, and current DNS-to-Worker routing were not read via authenticated Cloudflare APIs. Distinguish observed historical success from current state.
- A green catalogue CSV/API `RECONCILED_WITH_REVIEW_HOLDS` audit does **not** grant legal authority for continued public publication.

## Recommended next operational decision, not executed by this audit

**If no signed IGDB agreement explicitly permits public use**, pause further public IGDB promotion and promptly confirm the present licence position with IGDB. The user should check **GitHub → Settings → Secrets and variables → Actions → Variables** for `IGDB_COMMERCIAL_APPROVED`, and set it to `false` or remove it **unless documentary commercial-use approval is already established**. This prevents repeat invocation of the gated *promotion* workflow, **but does not remove the existing public data**.

Restoring a 100-PALScout-only public catalogue requires a coordinated **new approved baseline build**, not merely switching D1 pointers. A fully planned rollback would need to:
1. Make a clean private/source-safe 100-game dataset/index from the known protected `PALSCOUT_DEEP` rows, respecting whether any seed fields already include IGDB-enriched metadata.
2. Preserve working authentication, Saved Hunts, pricing UI and non-catalogue production services while replacing the static catalogue assets at grailraven.com; verify the live index count and search links after deployment.
3. Reconcile the D1 active catalogue separately: previous active dataset was **null**, so either stage and verify a new 100-game baseline dataset then activate it, or determine explicitly whether D1 catalogue can safely be deactivated without affecting app consumers; do not delete immutable history blindly.
4. Consider the GitHub Pages copy and the **public repository/source/history**. Simply reverting `catalogue/base-catalogue.json` and `catalogue-index.js` does not remove historical committed provider data from public history. Take legal/technical guidance on potential record unpublication and history rewriting before destructive changes.
5. Add an execution-of-IGDB-agreement gate to ordinary Cloudflare deployments *if they would serve IGDB-backed rows*, and verify attribution/retention restrictions from the executed licence.
6. Test preflight regressions and a non-production build first. Only carry out the public rollback after a clear operator authorisation; no prod rollback was authorised or performed in this audit.

**Status at audit completion:** investigation/documentation only; no change to Cloudflare, D1 active pointer, provider credentials, GitHub repository approval flags, public catalogue, or IGDB partnership correspondence. The licence/rollback choice remains **open**, and the signed agreement has not been received in this chat.
