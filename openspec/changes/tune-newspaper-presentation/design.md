# Design: tune-newspaper-presentation

## Context
The year-close flow (GameShell's `unseenPaper` derived + `year-close` overlay) blocks the game until the player clicks; the modal auto-opens on overlay click. `runEvents` creates a newspaper for **every** closed year in `events.newspapers`, even when `headlineFor(year)` is empty and no messages exist — those empty papers clutter the history list.

## Goals
- Newspaper is a **pull** surface, not a push interruption.
- Newspapers only exist for years with actual content.
- History list stays the canonical archive (newspaper + annual report per year).
- No save-format change.

## Non-Goals
- No changes to newspaper content curation (history.json) or message generation.
- No auto-open of the newspaper modal.
- No new save version; SAVE_VERSION 2 states remain valid (a v2 save that contains empty newspapers from old runs stays loadable — they are just never created again).

## Decisions
- **D1 — Content gate in `runEvents` (sim core):** create only when `headlineFor(year) !== '' || messages.length > 0`. Rationale: keeps `assembleNewspaper` pure and the gate deterministic; UI can rely on "every newspaper in state has content".
- *Rejected:* gating in the UI only — contradicts the game-events spec intent and leaves empty papers in state and history.
- **D2 — Non-blocking badge instead of overlay:** a small badge/button in the topbar (data-testid `newspaper-notice`) with the count of unseen newspapers, styled like the existing tram badge; click opens the latest unseen paper. Play continues; RAF loop untouched. Unseen tracking stays counter-based (`papersSeen`) so loaded saves surface their latest paper via the badge, not an overlay.
- **D3 — Auto-open removal:** the `year-close` overlay markup and the `unseenPaper`-driven auto-open branch are deleted together; the modal opens only from the badge or the history list. `dismissPaper` resets `papersSeen` to the full count (semantics unchanged).
- **D4 — Report modal unchanged:** the annual report keeps its current path (history list). No auto-presentation.
- **D5 — No migration of existing saves:** old v2 saves may contain empty newspapers; they still render (empty headline shows the placeholder). No structural requirement is violated.

## Risks / Trade-offs
- Players may miss a newspaper they *did* want — mitigated by the persistent badge until dismissed; the history list remains as archive.
- Empty-history years disappear from the history list (intended); save compatibility relies on newspapers being optional state.
- Deterministic replay differs from M1-era replays for content-less years (state no longer contains empty papers) — acceptable, documented in the proposal impact.
- A persistent badge could annoy as much as the overlay if styled aggressively — keep it subtle (static badge, no animation).
- Coal-crisis telegraph: the notice is a game message of year N (1893) and thus still creates that year's newspaper; the crisis mechanic is untouched.

## Pain Points
- `runEvents` currently pushes unconditionally (`events.newspapers.push(assembleNewspaper(state, settled.year))`) — needs the D1 gate before the push.
- The `year-close` overlay markup and the `unseenPaper` auto-open branch must be removed together; `showPaper`/`papersSeen` bookkeeping stays for the badge.
