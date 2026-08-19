# Delta Spec: game-ui

## MODIFIED Requirements

### Requirement: Player controls work
The UI SHALL provide: tariff adjustment (slider with €/kWh) and expansion orders (engine/generator) that call the corresponding sim functions; the UI SHALL NOT provide any staffing controls, and the derived staff count SHALL be shown read-only.

#### Scenario: Tariff change
- **WHEN** the player moves the tariff slider and releases it
- **THEN** the sim's tariff is set accordingly

#### Scenario: No staffing controls
- **WHEN** the player opens the plant panel
- **THEN** only tariff and expansion orders exist and no crew input exists

#### Scenario: Crew count visible
- **WHEN** the plant has operational components requiring 10 crew
- **THEN** the panel shows the derived staff count (10) without an input
