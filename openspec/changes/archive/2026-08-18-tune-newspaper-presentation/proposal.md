# Proposal: tune-newspaper-presentation

## Why
The current year close interrupts the game with a blocking "Jahr X ist vergangen" overlay and the newspaper auto-opens — players who do not care about the newspaper are forced to interact with it. Additionally the sim creates a newspaper for every closed year, even when history data has no entry and no game messages exist for that year, producing an empty paper.

## What Changes
- Newspapers are only created for years that actually have content (curated headline or game messages).
- Year close no longer blocks or interrupts: the newspaper surfaces as a subtle, dismissable notice; the game loop continues without any required interaction.
- The history list remains the always-available path to every past newspaper and annual report.

## Capabilities
- game-events
- game-ui

## Impact
- Sim core (`runEvents`): skips newspaper assembly for content-less years; deterministic replay changes for years without entries (no empty newspaper objects in state).
- UI (`GameShell`): blocking year-close overlay removed, replaced by a non-blocking notice (badge); auto-open of the newspaper modal removed.
- Tests: game-events tests for empty years; game-ui tests for non-blocking notice and play-through without interaction.
- Saves: fewer/unchanged newspaper entries — no save-version bump needed (SAVE_VERSION 2 states stay compatible; missing empty newspapers are not structurally required).
