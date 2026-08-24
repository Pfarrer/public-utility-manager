# Design: prevent-ui-line-breaks

## Context

All components use scoped `<style>` blocks; `white-space` is currently unset anywhere, so the browser default (`normal`) applies everywhere. Currency amounts are rendered as `{value.toLocaleString('de-DE')} $` — a breakable space between value and symbol.

## Decision

Two complementary mechanisms, applied by role:

1. **Non-breaking space (U+00A0) inside value+unit strings.** For text that flows in sentences, table cells and inline labels, the pair is glued with `&nbsp;` (rendered as `\u00A0`) so a line can never break between value and unit. This survives copy/paste and works without CSS.
2. **`white-space: nowrap` on chrome elements.** Top-bar buttons and badges are single-purpose controls; their labels must never wrap. The top bar itself keeps default wrapping between items.

A shared helper `money(value)` in `$lib/ui/format.ts` centralizes the money rendering (`toLocaleString('de-DE')` + `\u00A0$`), so future surfaces cannot reintroduce a breakable space by accident. Numeric pairs in panels (kW, workers, %) use `\u00A0` at the markup level.

## What we do NOT do

- No global `white-space` resets; only targeted elements.
- No layout overhaul of the top bar (flex-wrap between items stays).
- No truncation/ellipsis: an unbreakable pair that does not fit is preferable to a silently truncated amount.

## Risks

- `\u00A0` in expected test strings: tests must use the same non-breaking space when asserting rendered amounts (e.g. `50.000\u00A0$`). Test updates are part of this change.
- On very narrow viewports the unbreakable cash pair could stretch the top bar row; acceptable because the top bar wraps between items and the page has no horizontal-scroll container in M1.
