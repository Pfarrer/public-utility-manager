# game-ui Specification

## Purpose
Player interface for M1: schematic province map, region detail with live numbers and demand chart, plant and tariff controls, newspaper and report surfaces, game-over handling.

## Requirements

### Requirement: Province map shows four regions
The province map SHALL be a compact region selector: four region entries, the playable region highlighted, locked regions visually greyed with an unlock hint; it SHALL NOT render settlement circles (settlements are the city view's concern); selecting a region SHALL open the city view for it as the primary surface.

#### Scenario: Locked region hint
- **WHEN** the map renders and a locked region is hovered
- **THEN** a hint indicates it unlocks later (M1: not playable)

### Requirement: Region detail shows key figures
Selecting the playable region SHALL show households per wealth segment, electrification share, satisfaction and current quarter demand peak vs. capacity.

#### Scenario: Figures update after tick
- **WHEN** a quarter tick completes and the panel is open
- **THEN** the displayed figures reflect the new state

### Requirement: Demand chart with capacity line
The region detail SHALL include a 24-hour demand line chart and a horizontal capacity line; blacked-out hours (demand above capacity) SHALL be visually marked.

#### Scenario: Deficit visible
- **WHEN** the demand curve exceeds capacity at hours 18–20
- **THEN** those hours are marked (e.g. red segments) in the chart

### Requirement: Player controls work
The UI SHALL provide: tariff adjustment (slider with $/kWh) and expansion orders (engine/generator) that call the corresponding sim functions; the UI SHALL NOT provide any staffing controls, and the derived staff count SHALL be shown read-only.

#### Scenario: Tariff change
- **WHEN** the player moves the tariff slider and releases it
- **THEN** the sim's tariff is set accordingly

#### Scenario: No staffing controls
- **WHEN** the player opens the plant panel
- **THEN** only tariff and expansion orders exist and no crew input exists

#### Scenario: Crew count visible
- **WHEN** the plant has operational components requiring 10 crew
- **THEN** the panel shows the derived staff count (10) without an input

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

### Requirement: Game over overlay
On bankruptcy the UI SHALL show a game-over overlay with the final report and a restart option.

#### Scenario: Bankruptcy
- **WHEN** the game-over flag is set
- **THEN** the overlay blocks further play input and offers restart
