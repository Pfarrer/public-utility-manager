# Delta Spec: game-ui

## MODIFIED Requirements

### Requirement: Newspaper and report on year close
At a year close with a newspaper the UI SHALL surface it as a non-blocking notice (e.g. a badge with the unseen count); the game loop SHALL continue without requiring any interaction with the notice. Activating the notice SHALL open the newspaper modal, which SHALL be dismissable. The annual report SHALL be offered via the history list. The UI SHALL NOT auto-open the newspaper modal and SHALL NOT show a blocking year-close overlay.

#### Scenario: Year close
- **WHEN** quarter 4 of a year with a newspaper completes
- **THEN** no modal or overlay opens automatically; a non-blocking notice appears instead

#### Scenario: Notice opens on demand
- **WHEN** a newspaper notice is visible and the player activates it
- **THEN** the newspaper modal opens and can be dismissed

#### Scenario: No notice for empty year
- **WHEN** a year closes without a newspaper
- **THEN** no newspaper notice appears and no history entry exists for that year

#### Scenario: History list access
- **WHEN** the player opens the history list after a year with a newspaper closed
- **THEN** the newspaper and the annual report for that year are reachable there
