## Why

The player-facing layer of M1: schematic province map (circles = settlements, locked regions greyed), region detail with numbers, demand chart, plant panel and tariff control, newspaper modal, annual report and game-over screen. Makes the concept experienceable.

## What Changes

- Routes: start page (title + new game), game view (map + detail panes)
- Province map: SVG, 4 region frames, settlement circles sized by population, playable highlighted, locked greyed with hint
- Region detail panel: wealth segments, electrification, satisfaction, demand chart (24h SVG line), capacity line
- Plant panel: components, construction queue, staffing control, expansion buttons
- Tariff slider; newspaper modal on year close; annual report; game-over overlay
- Game loop integration: RAF accumulator advancing quarters at speed, pause/×1/×4

## Capabilities

### New Capabilities
- `game-ui`: playable M1 interface — map, region detail, controls, newspaper, report, game over

## Impact

- New `app/src/routes/` pages and `app/src/lib/components/`
- Depends on all gameplay systems; Svelte 5 runes (`$state`, `$derived`)
- happy-dom UI tests for key interactions
