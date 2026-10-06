# IGDB benchmark summary — 6 October 2026

First read-only benchmark completed successfully.

Results against pinned 100-game set:
- exact title/alias matches: 92
- review candidates: 2
- no matches: 6
- with cover art: 94
- with release-date metadata: 94
- with company metadata: 94

Exact/alias matches by platform:
- PS1: 38/40
- PS2: 36/40
- Dreamcast: 18/20

Raw IGDB platform record counts observed:
- PlayStation: 3,941
- PlayStation 2: 4,297
- Dreamcast: 739

These raw record counts are not equivalent to retail library totals and require filtering and deduplication.

The simple title-search pass exposed regional-title and naming differences. It also produced at least one unsafe prefix-style candidate, so fuzzy title matching must not auto-import or auto-merge catalogue identities.

Decision: IGDB remains promising, but the next step is a platform-wide alias/inventory benchmark with conservative identity resolution before any bulk canonical import.
