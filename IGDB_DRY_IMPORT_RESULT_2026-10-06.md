# IGDB Full Catalogue Dry Import Result — 6 October 2026

The first successful end-to-end dry import completed and produced a valid proposed catalogue.

## Result

- original PALScout seed games: 100
- proposed catalogue total: 8,441
- new BASE_ONLY games: 8,341
- seed games automatically enriched: 91
- seed games without exact provider mapping: 9
- held provider records: 38
- suppressed same-title records: 16
- provider same-title review groups: 33
- seed ambiguities: 3
- ID collisions: 0
- proposed catalogue validation: PASS

No canonical catalogue, D1 data or live artwork was modified.

## Remaining nine seed mappings

The unmatched seed set was reviewed against the full IGDB inventory and existing PALScout evidence.

Explicit provider mappings are now stored in:
`catalogue/provider-mappings/igdb.json`

They cover:
- Marvel vs. Capcom 2 -> Marvel vs. Capcom 2: New Age of Heroes
- Project Justice: Rival Schools 2 -> Project Justice
- Crash Bandicoot 3: Warped -> Crash Bandicoot: Warped
- Final Fantasy Anthology -> IGDB European Edition record
- MediEvil 2 -> MediEvil II
- Forbidden Siren -> Siren
- Obscure II -> ObsCure: The Aftermath
- Project Zero 3: The Tormented -> Fatal Frame III: The Tormented
- Shin Megami Tensei: Lucifer's Call -> Shin Megami Tensei: Nocturne

These are explicit audited mappings, not fuzzy search rules.

## Platform release-year correction

The successful dry run also exposed an important metadata-model issue.

IGDB `first_release_date` is the game's overall first release and is not necessarily the release date for the current platform. A PlayStation-attached record such as Zork can therefore carry a historical year from an earlier platform.

The importer now requests `release_dates` and derives `releaseYear` from the earliest release date specifically attached to the current PS1 / PS2 / Dreamcast platform.

If no platform-specific release date is available, `releaseYear` remains null rather than using a misleading global date.

## Next gate

Rerun the full-catalogue dry import with:
- explicit nine-seed mapping overrides
- platform-specific release years

Expected outcome:
- all 100 PALScout seed games mapped/enriched
- no duplicate BASE_ONLY records for the eight regional-title mappings that previously imported separately
- valid proposed catalogue
- review-only handling remains for unresolved provider same-title collisions

Only after reviewing that rerun should a canonical promotion workflow be built.
