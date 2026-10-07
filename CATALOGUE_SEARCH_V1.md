# Catalogue Search v1

Last updated: 6 October 2026

## Purpose

GrailRaven catalogue search should be forgiving for collectors without weakening the strict identity rules used by catalogue imports or PALScout.

These are separate concerns:

- **user-facing catalogue search** may use aliases, abbreviations, partial titles, numeral variants and conservative typo correction
- **provider/canonical identity matching** must remain strict and may not use fuzzy search as proof of identity
- **PALScout physical-copy classification** remains evidence based and is not affected by fuzzy catalogue search

A user being able to find a game by typing `FF7` does not mean a provider record or marketplace listing can be silently merged from a fuzzy title match.

## Search index

The browser receives the compact catalogue index only:

- stable game ID
- title
- platform
- aliases
- release year
- PALScout coverage state

The full provider/provenance record is not shipped to every browser page.

The index remains capped at 2 MiB by promotion validation.

## Curated search aliases

`catalogue/search-aliases.json` is provider-independent.

It exists for collector-facing names that should remain useful even if GrailRaven changes catalogue providers.

Examples include:

- Final Fantasy VII → FF7 / FFVII / Final Fantasy 7
- Jet Set Radio → Jet Grind Radio / JSR
- Forbidden Siren → Siren
- Project Zero 3 → Fatal Frame 3 / Fatal Frame III
- Shin Megami Tensei: Lucifer's Call → SMT3 / Nocturne
- Obscure II → ObsCure: The Aftermath
- MediEvil 2 → MediEvil II

The same file can also suppress provider aliases that are misleading for search.

Current example:
- BloodRayne provider alias `Nocturne` is suppressed because it is not a useful collector-facing search path and conflicts with the SMT regional name.

Curated aliases/suppressions affect the browser search index and the D1 search-alias mirror. They do not rewrite the provider's raw source data.

## Ranking

The shared ranking implementation is:

`shared/catalogue-search-core.js`

Ranking priority is intentionally conservative:

1. exact canonical title
2. exact alias
3. title/alias acronym
4. title/alias prefix
5. title/alias contains
6. in-order token subsequence
7. bounded typo correction

Roman numerals II–X also receive Arabic-number search variants, so examples such as `MediEvil II` and `Project Zero III` can match their equivalent numeric form.

Typo correction is bounded by query length and is deliberately weaker than exact/prefix/alias matches.

## Ambiguity

Search must not silently choose between equally plausible canonical games.

Examples:
- `MGS3` can mean Snake Eater or Subsistence in the full PS2 catalogue
- `RE2` without a platform can resolve to both PS1 and Dreamcast

When the top results are tied, the resolver returns `ambiguous` and the UI asks the user to select the exact title/platform from suggestions.

A sufficiently separated typo result may be returned as `corrected`.

## Browser autocomplete

The production Search page no longer creates thousands of native `<option>` elements.

Instead:

- catalogue records remain in memory
- typing is debounced
- only the best six suggestions are rendered
- suggestions show title and platform
- when an alias produced the match, the matched alias is shown
- keyboard Up/Down/Enter/Escape is supported
- selecting a suggestion also selects its platform
- the approved v2 Search layout is unchanged when the suggestion list is closed

This is particularly important for the future 8,433-game catalogue on mobile.

## Full-catalogue benchmark

`scripts/benchmark-catalogue-search.mjs` runs against the development-only full candidate.

The benchmark covers:

- exact titles
- partial titles
- abbreviations: FF7, FFVII, MGS3, RE2, JSR, SMT3
- regional names: Jet Grind Radio, Siren, Fatal Frame, Nocturne, Biohazard
- Roman/Arabic numeral variants
- punctuation differences
- cross-platform duplicates
- deliberate ambiguity
- common typo correction
- token-subsequence searches

Performance guardrails on the GitHub Actions runner:

- compact index <= 2 MiB
- median query <= 60 ms
- p95 query <= 120 ms
- maximum sampled query <= 250 ms

These are regression budgets, not claims about every end-user device.

## Promotion gate

The hard-gated full-catalogue promotion workflow now runs the search benchmark before D1 staging or publication.

A dataset that validates structurally but fails search quality/performance cannot be promoted through the approved workflow.

The IGDB-backed 8,433-game catalogue remains unpublished until the commercial-use gate is resolved.


## Validated benchmark — 7 October 2026

Workflow run `37634702409` passed all benchmark checks.

Results:
- 8,433 catalogue games
- 1.372 MiB compact search index
- 24/24 quality cases passed
- median query: 57.58 ms
- p95 query: 105.82 ms
- max sampled query: 127.22 ms
- index build: 61.72 ms

All configured quality and performance gates passed on the GitHub Actions runner.


## Production rollout — 7 October 2026

The ranked autocomplete/search layer was deployed to the current public 100-game GrailRaven catalogue after the full 8,433-game benchmark passed.

Deployment run: `37637618874`

Pre-deploy safeguards verified:
- exactly 100 canonical games
- all current records PALSCOUT_DEEP
- generated production browser index exactly 100 games
- ranked search module included in the Cloudflare static bundle

The 8,433-game IGDB-backed candidate remains unpublished pending completion of the IGDB partnership agreement.

Cloudflare Worker version:
`64adffea-1482-4e42-a39f-8481ee303dc3`
