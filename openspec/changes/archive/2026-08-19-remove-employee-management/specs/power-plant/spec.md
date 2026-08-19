# Delta Spec: power-plant

## MODIFIED Requirements

### Requirement: Staffing scales with components
Required crew SHALL increase with installed components; staff SHALL be hired and dismissed implicitly from operational needs (operational components only) and SHALL NOT be player-settable; plants SHALL be considered fully staffed, so available capacity SHALL equal installed capacity.

#### Scenario: Understaffed plant
- **WHEN** a plant requires 20 crew (derived from operational components)
- **THEN** staffing is implicit at full level: available capacity equals installed capacity and wages are booked for 20 crew

#### Scenario: Automatic hiring
- **WHEN** a plant has 1 operational engine (staffing 8) and 1 operational generator (staffing 2) and a second generator completes
- **THEN** required staff rises from 10 to 12 and the next quarter's wage bill grows accordingly
