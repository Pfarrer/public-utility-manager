## MODIFIED Requirements

### Requirement: Capacity derives from components
Plant capacity SHALL equal the sum of generator capacities that are driven by an operational steam engine; engines and generators SHALL be counted separately. Capacity SHALL be split by current type: DC capacity and AC capacity SHALL be tracked separately while total capacity stays their sum; a generator's current type SHALL derive from its catalog entry (`currentType`).

#### Scenario: New plant
- **WHEN** a plant starts with 2 engines (each able to drive 3 generators) and 6 generators of 50 kW
- **THEN** capacity is 300 kW

#### Scenario: Mixed plant
- **WHEN** a plant has one DC generator (50 kW) and one AC generator (100 kW) operational
- **THEN** its DC capacity is 50 kW, its AC capacity 100 kW, its total capacity 150 kW

#### Scenario: Under construction adds nothing
- **WHEN** a generator is under construction
- **THEN** it contributes to neither DC nor AC capacity

### Requirement: Expansion actions
The player SHALL be able to order additional engines and generators for an existing plant, subject to catalog cost and build time. The catalog SHALL contain a three-phase generator (`alternator-1892`) orderable only from game year 1892 onward; before that year the UI SHALL show it disabled with an availability hint rather than hiding it.

#### Scenario: Order extra generator
- **WHEN** the player orders an extra generator and cash covers the cost
- **THEN** a construction order exists and cash is debited on completion

#### Scenario: Alternator locked before 1892
- **WHEN** the game year is 1891 and the player opens the plant panel
- **THEN** the three-phase generator is visible but not orderable, with a hint naming 1892

#### Scenario: Alternator orderable from 1892
- **WHEN** the game year is 1892 or later
- **THEN** the three-phase generator can be ordered like any other generator
