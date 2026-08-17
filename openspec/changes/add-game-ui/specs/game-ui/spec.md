## Purpose

Player interface for M1: schematic province map, region detail with live numbers and demand chart, plant and tariff controls, newspaper and report surfaces, game-over handling.

## ADDED Requirements

### Requirement: Province map shows four regions
The map SHALL render four region frames; the playable region SHALL be highlighted and locked regions SHALL be visually greyed with an unlock hint; settlements SHALL be circles sized by population.

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
The UI SHALL provide: tariff adjustment (slider with €/kWh), staffing level input, and expansion orders (engine/generator) that call the respective game actions with validation feedback.

#### Scenario: Tariff change
- **WHEN** the player moves the tariff slider to 0.40 €/kWh
- **THEN** the state tariff is 0.40 and next quarter's revenue uses it

### Requirement: Newspaper and report on year close
At each year close the UI SHALL present the newspaper modal (headlines + game messages) and offer the annual report; both SHALL be dismissable and reachable again from a history list.

#### Scenario: Year close
- **WHEN** quarter 4 of a year completes
- **THEN** the newspaper modal opens automatically

### Requirement: Game over overlay
On bankruptcy the UI SHALL show a game-over overlay with the final report and a restart option.

#### Scenario: Bankruptcy
- **WHEN** the game-over flag is set
- **THEN** the overlay blocks further play input and offers restart
