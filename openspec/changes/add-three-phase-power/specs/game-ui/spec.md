## MODIFIED Requirements

### Requirement: Player controls work
The UI SHALL provide: tariff adjustment (slider with $/kWh) and expansion orders (engine/generator) that call the corresponding sim functions. From game year 1892 onward the UI SHALL additionally provide an AC tariff slider (three-phase, $/kWh, same bounds). The UI SHALL NOT provide any staffing controls, and the derived staff count SHALL be shown read-only.

#### Scenario: Tariff change
- **WHEN** the player moves the tariff slider and releases it
- **THEN** the sim's tariff is set accordingly

#### Scenario: No staffing controls
- **WHEN** the player opens the plant panel
- **THEN** only tariff and expansion orders exist and no crew input exists

#### Scenario: Crew count visible
- **WHEN** the plant has operational components requiring 10 crew
- **THEN** the panel shows the derived staff count (10) without an input

#### Scenario: AC tariff from 1892
- **WHEN** the game year is 1892 or later
- **THEN** an AC tariff slider is available and setting it changes the AC tariff only

#### Scenario: No AC slider before 1892
- **WHEN** the game year is 1891
- **THEN** no AC tariff slider is rendered

## ADDED Requirements

### Requirement: Customer mix splits by current type
The customer mix panel SHALL split each settlement's per-segment shares by current type (⎓ DC / ~ AC) in addition to the per-wealth-segment percentages; when a settlement's AC shares are all zero the panel SHALL show a hint that three-phase has no customers yet.

#### Scenario: Split shown
- **WHEN** a settlement's wealthy segment has dc 0.50 and ac 0.20
- **THEN** the panel shows 50 % ⎓ and 20 % ~ for that segment

#### Scenario: No AC customers hint
- **WHEN** all of a settlement's AC shares are zero while AC capacity exists in the region
- **THEN** the panel shows the three-phase no-customers hint
