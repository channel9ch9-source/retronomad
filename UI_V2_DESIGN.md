# GrailRaven UI V2 Design Specification

Last updated: 6 October 2026

This file is the durable design record for the GrailRaven UI refresh. The repository is authoritative; chat history is supplementary.

## Status

A separate non-production preview exists at `design-preview.html` with shared styles in `ui-v2.css`.

The preview must remain isolated from the live Deal Finder until the visual direction is approved. Example listings, prices, result counts and artwork blocks must remain clearly labelled as example UI data and must never be represented as live marketplace inventory.

## Chosen direction

The selected direction is **Collector Intelligence**:
- modern, serious collector tool
- dark, premium presentation
- exact-copy hunting is the primary use case
- box/game art can add colour and nostalgia, but the interface itself should remain restrained
- evidence and release identity are more important than decorative retro gimmicks
- no CRT/VHS/pixel-font theme as the primary visual language

The user preferred the first visual mockup, combined with the more elegant raven branding treatment shown in the second mockup.

## Locked colour decisions

Current requested accents:
- MATCH status green: `#00FF41`
- REVIEW orange: `#FF5C00`
- FILTERED / rejected red: `#FF0023`

The previous murky dark-blue base is rejected.

Base direction:
- page background: plain black for the current pass
- panels: plain black with neutral grey borders
- blue should not be the primary interaction accent
- search focus, checked controls, selected platform states and navigation highlights should be neutral white/grey for now
- green is reserved primarily for positive MATCH status while the broader accent system remains open

The exact neutral black/charcoal shades may still be refined visually, but the overall direction is locked.

## Typography

The previous generic-looking typography is rejected.

Direction:
- wordmark and major headings: characterful gothic / old-world / engraved serif feeling
- body text, controls, filters and dense evidence: clean readable sans-serif
- readability takes priority over using a decorative font everywhere

The V2 preview currently keeps a display-serif experiment, but typography is explicitly **not final**. Do not spend more time selecting a final typeface during the current product-development pass.

## Logo

Preferred direction:
- elegant raven/crow emblem from the second visual mockup
- bird + GrailRaven wordmark treatment
- more distinctive and premium than the first simple placeholder mark

The prior inline SVG approximation was rejected. The preview now uses the raven mark isolated from the preferred second visual mockup so the intended silhouette is represented accurately. This extracted preview asset is still not the final production logo file; final vector cleanup can happen later.

## Desktop structure

Primary structure:
1. GrailRaven header / navigation
2. short collector-intelligence hero
3. prominent game search
4. PS1 / PS2 / Dreamcast platform controls
5. left-side advanced filter panel
6. evidence-first result cards
7. price/reference block
8. MATCH / REVIEW / FILTERED states

Important fields visible in result cards should include, when real data exists:
- marketplace image
- game + platform
- release / territory
- edition
- completeness
- identifying evidence
- delivered price
- trusted reference price
- provider attribution
- match state and review reason

## Mobile-specific design

The desktop layout must NOT simply stack every desktop element vertically.

For phone layouts:
- shorten the hero substantially
- hide decorative hero artwork
- replace the permanently visible filter sidebar with a Filters button/drawer
- keep platform controls horizontally scrollable
- use compact result cards
- show one main cover image
- hide secondary evidence thumbnails by default
- reduce long descriptions
- move/stack the price area below the main card content
- keep critical fields visible: title, status, territory, edition/completeness and delivered price
- secondary evidence can be expanded later
- reduce vertical scrolling wherever possible

## Functional protection

The visual redesign must preserve the existing working product logic:
- PALScout classification
- MATCH / REVIEW / FILTERED semantics
- Saved Hunts
- account/passwordless authentication
- D1 sync
- existing search-target schema
- marketplace adapter contracts
- PriceCharting attribution requirements when that provider goes live

Do not rewrite working internals purely to fit a visual mockup.

## Rebrand resilience

GrailRaven may be renamed in the future.

Therefore:
- UI components should consume central brand configuration where practical
- do not introduce unnecessary `grailraven-*` core identifiers
- logo/wordmark/presentation assets may be branded
- databases, schemas, API concepts and classification logic should remain brand-neutral

## Implementation sequence

1. V2 preview palette + typography + logo direction.
2. V2 mobile simplification.
3. Review preview on desktop and phone.
4. One or two focused refinement passes only.
5. After approval, migrate shared V2 components/styles to the real Search page.
6. Propagate approved header/design system to Saved Hunts, Account, listing checker and homepage.
7. Continue full PS1 / PS2 / Dreamcast base catalogue work after the core UI shell is stable.

## Current design decisions that remain open

- final production raven artwork
- final display font
- exact neutral charcoal shades
- whether the homepage uses real licensed game art/box art and from which source
- final density of evidence thumbnails on desktop
- final mobile expanded-evidence interaction


## Search hero artwork behavior

The original mockup intent is restored: the hero/search area should visually respond to the game being searched.

Target production behavior:
- once the catalogue has a legitimate artwork/cover source, searching/selecting a game should populate the hero background with that game's cover/artwork
- a dark overlay must preserve text/search readability
- artwork is presentation only; it must not change matching logic
- the preview currently uses a structured placeholder layer because the project has not yet selected a licensed/authorised full-catalogue artwork source
- do not scrape or hotlink arbitrary copyrighted box art just to fill the preview

## Visual work pause

After the current cleanup pass, visual design is intentionally parked so development can return to catalogue/product work.

Still open for a later design session:
- final typeface
- final vector/production raven logo asset
- exact hero-art treatment once an artwork source is selected
- any further aesthetic polish not required for usability

Do not allow these open visual questions to block full-catalogue architecture or core product development.
