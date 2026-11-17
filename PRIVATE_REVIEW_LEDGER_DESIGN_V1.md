# GrailRaven — private reviewer access and audit ledger design v1

**Date:** 17 November 2026. **Status: OFFLINE PROPOSAL / ISOLATED TESTS ONLY.** No migration has been applied to D1, no reviewer accounts/privileges have been created, no photo has been ingested, and no browser, Worker, admin route, API, Saved Hunt notification, verified `MATCH`, or Cloudflare deployment has been altered.

This design builds on [PHYSICAL_REVIEW_WORKFLOW_V1.md](PHYSICAL_REVIEW_WORKFLOW_V1.md), [PHYSICAL_COPY_VERIFICATION_V1.md](PHYSICAL_COPY_VERIFICATION_V1.md) and the four source-researched but **not specimen-verified** examples in [PHYSICAL_RELEASE_REFERENCE_STUDY_V1.md](PHYSICAL_RELEASE_REFERENCE_STUDY_V1.md).

## 1. Existing system and why its login is not enough

The GrailRaven app has ordinary passwordless collector accounts with `users`, `auth_tokens` and `sessions` tables, and a Cloudflare Worker in `backend/alerts-worker.js`. Having a collector session is **not** a reviewer credential, and the existing `ADMIN_TOKEN` is for operational scheduler testing, **not** a reviewer credential. This change does not grant existing users new powers or expose a new internal route.

A future reviewer service needs a **separate** identity/role enrolment and stronger reauthentication for privileged operations, with explicit review case assignment and a trusted server-provided permission context. Client-submitted `role`, `verified`, `reviewerApproved` or `MATCH` values must be ignored.

## 2. Offline-only SQL schema proposal (do not apply)

The SQL is intentionally in **`proposals/private-review-ledger-v1.sql`**, NOT `backend/migrations/`, because the latter is GrailRaven's active Wrangler/D1 migration directory. It uses SQLite-compatible tables, foreign keys, CHECK constraints and triggers. It is tested against a temporary `:memory:` database, never the live DB.

| Table | Data and responsibility |
| --- | --- |
| `reviewer_access_grants` | Who was granted which private role, by whom, from/until when. A grant is immutable. |
| `reviewer_access_revocations` | Revocations append records; do not rewrite earlier grants. |
| `reviewer_cases` | Immutable binding to provider listing ID, snapshot hash, reference ID + version, target hash, evidence manifest hash, permission-record reference, expiry. |
| `reviewer_case_heads` | Mutable version/hash/invalidation projection, advanced by event triggers, for fast status lookups. **Not the source of truth.** |
| `reviewer_case_assignments` / `reviewer_case_unassignments` | Appointment and withdrawal history; assignment requires an active reviewer grant and a noninvalidated case, but trusted backend authorization is still required. |
| `reviewer_case_events` | Append-only per-case ordered events. Each includes event type, actor user ID, time, sequence, previous hash, new event hash and minimal JSON payload. |

Important: only **fixed hashes, references and minimal reason codes** should go in the reviewer ledger. Keep sensitive image bytes, permitted original source snapshots, source-rights evidence, seller/customer identifiers and personal data in separately protected data/storage, with deliberate retention and deletion rules. Case source/external item IDs and reviewer IDs are still private data and must never be included in public responses.

### Invariants actually exercised in SQLite

- Insert a case → automatically create head at version 0.
- Append event 1 → previous hash must be null; append event 2 → prior hash must match; skip/replay/out-of-order sequence → rejected.
- A terminal invalidation prevents any further event append to that case; subsequent reassessment requires a **new case**, not rewriting an existing decision.
- Updates/deletes to historical cases, role grants/revocations, assignments/unassignments and events are blocked by triggers.
- Foreign keys enforce references to users/cases/grants; grants are restricted to `REVIEWER`, `SENIOR_REVIEWER`, `REVIEW_ADMIN`, `AUDITOR`.
- A failed multi-write operation in a SQLite transaction can roll back the events/head without partial state.

**These SQL rules do not provide cryptographically tamper-evident history or reviewer identity security.** A privileged DB operator could rewrite triggers or head rows. The currently supplied hash is not recomputed or signed by SQL; a malicious caller with write access can invent a self-consistent chain. A future private service must canonicalise and hash the correct permitted bytes **server-side**, enforce atomic case/event/role checks, restrict DB credentials, use independent backups/anchors where warranted, and provide monitorable audit logs. This design is safe precisely because it isn't connected to any privileged production endpoint.

## 3. Least-privilege role policy (offline advisory only)

The pure code in `shared/reviewer-access-policy-study.js` illustrates a **deny-by-default** decision policy. It must be called only with future **server-fetched** session identity, grant/revocation, assignment, case and rights records. A caller can forge those inputs today: it is **not an auth system**, and its `POLICY_ELIGIBLE` result is never sufficient to authorise a request.

| Role | Simulated allowed actions |
| --- | --- |
| Reviewer | Read their assigned case; enter provisional findings |
| Senior reviewer | The above plus submit a provisional assessment and invalidate assigned cases |
| Review administrator | Assign cases, append revocations, invalidate cases, read a *redacted* audit view (redaction not implemented) |
| Auditor | Read a *redacted* audit view only (redaction not implemented) |

Every sensitive action requires an active private grant, valid existing reviewer identity, a recent step-up (15-minute maximum in this **proposed** policy), an active case, and explicit source rights for private review. Reviewer and senior actions additionally require a currently assigned case. Self-review is prohibited. Collector sessions alone are insufficient. `APPROVE_MATCH`, `CERTIFY_COPY` and `ISSUE_VERIFIED_ALERT` are absent from the policy by design.

The policy always returns `authoritative:false`, `canPromoteToMatch:false`, and `canTriggerVerifiedAlert:false`, even for a role/action combination that would be eligible if verified server-side.

## 4. Proposed future secure backend (NOT IMPLEMENTED)

A future service must have a private-only, separately reviewed authorization layer. Proposed flow:

1. **Authenticate and step-up**: verify a real server session and current step-up independently, load the existing **server-stored** reviewer grant and revocations; never grant a reviewer role via a publicly callable endpoint or emailed link alone.
2. **Authorise per operation**: fetch the exact private case, signed-off source-rights record and any assignment; reject self-review, disallowed role, stale case, invalid assignment, revoked/expired grants and access outside the reviewer's scope.
3. **Validate evidence provenance**: do not trust client hashes, photo labels, seller-provided stock status, publicly sourced research fixtures or outdated snapshots. Check actual bytes with a rights-gated ingestion service, independent reference version and latest listing status.
4. **Commit transactionally**: enforce optimistic case sequence, event ID uniqueness, current rights/case state and event timestamp. Hash canonical event content on the server, append the event and update its head atomically. Reviewer action logs should be independent of the case log for security incidents.
5. **Invalidate/expire**: source permission withdrawal, new seller photos/condition/price, stock changes, reference corrections, changed target or revocation require a terminal event; use a new case for new evidence. This does not automatically delete content that must legally be removed—separate retention/deletion mechanisms and obligations apply.
6. **Fail closed at publication**: until separately authorised, reviewed and tested, no private assessment becomes a public `MATCH`, verified alert, image redistribution or B2B record. Implement explicit rollback and risk review before any pilot.

### Key threats & unfinished work

- Database roles cannot safely distinguish real admins if all Worker code shares a privileged D1 binding; use a **separate private service boundary** with constrained access.
- No authentication or privileged reviewer onboarding, CSRF controls, step-up implementation, role administration, or private admin console exists here.
- SQL event-type allowlists/sequence guards do not validate the **meaning** of an event or actor's role; the previous offline state machine validates some sequencing but is not authoritative.
- No server-generated event SHA-256, cryptographic signatures, external anchored audit trail, protected evidence store or tamper-evident backup yet.
- No photographed or approved original specimens, confirmed marketplace inventory/image-rights grants or production CIB rubric. The four release case studies remain public **research candidates** only.
- No user-upload privacy notice, storage retention/deletion process, source permission audit, rights revocation flow or real alert expiry enforcement yet.
- No proof of accuracy, cost or commercial viability; reviewers may be expensive per listing. Pilot only with permission.

## 5. Tests and deployment guardrails

- `tests/private-review-ledger-sqlite.test.mjs` executes `proposals/private-review-ledger-v1.sql` inside **temporary in-memory SQLite** via Node 22's `node:sqlite` experimental module. It verifies referential constraints, immutable history, event chain sequencing, invalidation, assignment/grant lifecycle and transactional rollback. No migration is applied.
- `tests/reviewer-access-policy-study.test.mjs` exercises role boundaries, self-review, expired grants, step-up freshness, rights withdrawal, forged "approval" and assignment scoping. Outcomes are *advisory only*.
- All existing `node --test` tests and Cloudflare builds still run as before. Node 22's SQLite API is currently experimental; pin/test CI Node version and revisit if it changes.
- **No code imports this proposal into production**, no D1 schema changes, no new env vars, no provider access or licensing updates. Site remains unchanged.

### Next recommended task

After this private design: review the trust-boundary/security architecture and prepare a server-only **non-deployed, read-only** case-list access adapter with denial-first tests, using a mocked backend identity/rights provider. Do **not** implement authority to record a genuine verified `MATCH` or upload real images until legal rights, privacy controls, source verification and reviewer authentication exist.

Follow [IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md](IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md) and the unresolved contracting-party safeguards. Never assume third-party data access gives rights to copy/store/publish photographs.
