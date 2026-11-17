# GrailRaven offline review desk — synthetic prototype

**Status:** LOCAL PREVIEW ONLY, not a private production service, not a login, not operational verification.

The prototype shows a practical read-only reviewer experience with four **fictional** cases modelled on our research reference study. No images, personal information, third-party source records, real listings, or actual permissions are loaded.

## View locally

From a local checkout of this repository, run:

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open **http://127.0.0.1:8765/prototypes/reviewer-console/** in your browser. This is a **local preview**, not the hosted GrailRaven product.

The local HTTP server is needed because the prototype uses standard JavaScript modules. The page itself makes **no external service requests**, has no upload function, and doesn't write to storage or a database. Stop the server using Ctrl+C. Do not upload or host this folder publicly as a reviewer application: its case data and mock "access" scenarios are openly embedded in browser-delivered JavaScript.

## What you can try

1. Select **Reviewer A (simulated)**: sees three assigned cases, including a Vagrant Story copy missing barcode/photo labels, an unresolved shared-PAL Silent Hill case, and a three-disc FFVII case missing disc-three evidence.
2. Select the **Evidence gaps** or **Review history** tab for any accessible case. All timelines are fictional: the reviewer events are generated from the *offline* state-machine, not a server ledger.
3. Select **Senior reviewer B (simulated)**: only sees a fictional Silent Hill 2: Director's Cut Platinum case with four of nine provisional checks recorded.
4. Select **No reviewer session (denied)**: sees no case details. This demonstrates intent, **not** authentication.
5. Use the case status filter to narrow the visible queue. There is **no** approve, upload, modify, notify or public MATCH action.

The UI is deliberately responsive, visually distinct from GrailRaven's public site, and uses DOM `textContent` to render dynamic case labels rather than inserting arbitrary HTML.

## Boundaries

- `model.js` is a **synthetic read-only demonstration adapter**. It uses `shared/reviewer-access-policy-study.js` to *illustrate* case-scoped access against a mocked reviewer session, grant and assignment. Browser users can replace these inputs; no part of this should be treated as a real security boundary.
- Reference/photograph statuses come from the existing **offline**, untrusted metadata checkers and fixed authored research examples. No one has inspected or authenticated a seller's actual item.
- No production Worker route, real auth token, user data, actual rights grant, D1 migration, image storage, live alerts or original IGDB/PriceCharting/marketplace records are involved.
- The Cloudflare build's root-file-only copy excludes the `prototypes/` directory. Do **not** integrate this folder into the Cloudflare build, GitHub Pages, customer site, or app Worker without a separately authorised privacy, licensing and security review.

## Next steps for a real private service

A read-only **trusted server-side** adapter needs role enrolment and recent step-up auth, database-scoped assignments, separate reviewer credentials, source-rights verification, a private evidence store and redacted case projections generated on the server. The prototype only shows the desired workflow.

A later pilot can assess whether reviewing actual items is valuable enough to justify the time and costs, but only after permitted first-party specimens and marketplace inventory/photo rights have been obtained.

See [PRIVATE_REVIEW_LEDGER_DESIGN_V1.md](../../PRIVATE_REVIEW_LEDGER_DESIGN_V1.md), [PHYSICAL_REVIEW_WORKFLOW_V1.md](../../PHYSICAL_REVIEW_WORKFLOW_V1.md), and [IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md](../../IGDB_CONTRACT_COMPLIANCE_GUARDRAILS.md).
