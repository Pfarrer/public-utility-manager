# power-plant Specification

## Purpose
Component-based power plant: steam engines and generators as separately buildable/expandable parts, realistic construction lead times and staffing requirements.

## Requirements

### Requirement: Capacity derives from components
Plant capacity SHALL equal the sum of generator capacities that are driven by an operational steam engine; engines and generators SHALL be counted separately.

#### Scenario: New plant
- **WHEN** a plant starts with 2 engines (each able to drive 3 generators) and 6 generators of 50 kW
- **THEN** capacity is 300 kW

### Requirement: Construction takes quarters
Component orders SHALL complete after the component's build time in quarters (1–2 in M1 data); incomplete components SHALL not contribute capacity.

#### Scenario: Generator under construction
- **WHEN** a generator with build time 2 is ordered in 1890 Q1 and the clock is at 1890 Q2
- **THEN** it contributes no capacity; at 1890 Q3 (delivery) it does

### Requirement: Expansion actions
The player SHALL be able to order additional engines and generators for an existing plant, subject to catalog cost and build time.

#### Scenario: Order extra generator
- **WHEN** the player orders an extra generator and cash covers the cost
- **THEN** a construction order exists and cash is debited on completion

### Requirement: Staffing scales with components
Required crew SHALL increase with installed components; staff SHALL be hired and dismissed implicitly from operational needs (operational components only) and SHALL NOT be player-settable; plants SHALL be considered fully staffed, so available capacity SHALL equal installed capacity.

#### Scenario: Understaffed plant
- **WHEN** a plant requires 20 crew (derived from operational components)
- **THEN** staffing is implicit at full level: available capacity equals installed capacity and wages are booked for 20 crew

#### Scenario: Automatic hiring
- **WHEN** a plant has 1 operational engine (staffing 8) and 1 operational generator (staffing 2) and a second generator completes
- **THEN** required staff rises from 10 to 12 and the next quarter's wage bill grows accordingly
