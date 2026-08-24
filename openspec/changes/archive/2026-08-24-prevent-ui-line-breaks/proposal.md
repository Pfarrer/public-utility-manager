# Proposal: prevent-ui-line-breaks

## Why

At narrow viewport widths the UI breaks value+unit pairs across lines. The most visible case: in the top bar the cash amount and the `$` sign are separated by a normal space, so the currency symbol wraps onto its own line. Buttons and badges can also wrap their label text. Each of these looks broken rather than merely cramped.

## What Changes

- Cash, tariff and report amounts bind value and currency (`$`, `$/kWh`) together with a non-breaking space so they always render on one line.
- Buttons and badges in the top bar never wrap their labels (`white-space: nowrap`).
- Numeric value+unit pairs in panels (kW figures, worker counts, percentages) keep value and unit on one line via non-breaking spaces.
- The top bar itself remains allowed to wrap between its items (title, clock, cash, badges, buttons) so it degrades gracefully on narrow screens instead of overflowing horizontally.

## Impact

- Spec deltas: `game-ui` (one ADDED requirement).
- Code: `GameShell.svelte`, `ReportModal.svelte`, `PlantPanel.svelte`, `RegionDetail.svelte` (markup + scoped styles), plus UI tests.
- No data model, save-game or simulation changes.
