# Delta Spec: game-ui

## MODIFIED Requirements

### Requirement: Player controls work
The UI SHALL provide: tariff adjustment (slider with €/kWh) and expansion orders (engine/generator) that call the respective game actions with validation feedback. The UI SHALL NOT offer staffing controls.

#### Scenario: Tariff change
- **WHEN** the player moves the tariff slider to 0.40 €/kWh
- **THEN** the state tariff is 0.40 and next quarter's revenue uses it

#### Scenario: No staffing controls
- **WHEN** the player opens the plant panel of a built plant
- **THEN** no crew input is offered and capacity is shown as the installed capacity
