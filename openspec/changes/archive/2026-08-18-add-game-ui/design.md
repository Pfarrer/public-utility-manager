## Context

Svelte 5 runes for state binding; core stays framework-free (UI calls pure action/tick functions). SVG-first for map and charts (no chart lib per README). Predecessor lessons: RAF accumulator with pause/speed, per-file happy-dom docblocks for Vitest 4, act() around store-mutating clicks.

## Goals / Non-Goals

**Goals:**
- All M1 mechanics operable without console
- Re-render discipline: tick updates state once, components derive

**Non-Goals:**
- Polish, animation, sound, responsive/mobile
- Network map view (Ansicht 2) — later milestone
- Settings/scenario picker

## Decisions

- **One game route with panes** instead of deep routes — game is a single screen experience in M1.
- **Custom SVG chart component** (points from curve arrays) — reusable for report charts.
- **UI state via runes holding GameState**; actions replace state immutably (tick returns new state) so derivations stay simple.

## Risks / Trade-offs

- Svelte 5 runes + immutable core requires careful `$state` wrapping of new objects — keep one canonical `game` state object per session.
- SVG layout of region frames hand-tuned; acceptable for 4 fixed regions.
