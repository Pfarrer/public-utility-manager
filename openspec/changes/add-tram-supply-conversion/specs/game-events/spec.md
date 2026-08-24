## ADDED Requirements

### Requirement: Tram conversion demand arrives with the three-phase era
The tram company SHALL request conversion of its supply to three-phase at a data-driven due year (`history.json` `tramConversion.dueYear`), announced one year ahead via a newspaper/message (analogous to the coal-crisis telegraph); the conversion SHALL NOT be rejectable — the player can only prepare by building.

#### Scenario: Announcement one year ahead
- **WHEN** the game year reaches `announceYear` (1896)
- **THEN** a newspaper/message announces the tram's supply conversion for `dueYear` (1897)

#### Scenario: Conversion is not rejectable
- **WHEN** the conversion announcement is shown
- **THEN** no accept/reject choice is offered; only preparation (building AC capacity and a converter station) is possible

#### Scenario: Conversion takes effect
- **WHEN** the game year reaches `dueYear` (1897)
- **THEN** the tram load counts toward AC demand including the converter loss factor

## MODIFIED Requirements

### Requirement: Tram offer is decidable
In game year 2 the tram company SHALL offer a contract (80 kW continuous, 70% of tariff, 5 years); the player SHALL accept or reject; acceptance SHALL add the load and contract revenue and boost city growth; rejection SHALL leave the tram buying at normal tariff without growth boost. This contract governs commercial terms only; the tram's later supply conversion to three-phase (separate requirement) SHALL NOT terminate or re-open the contract.

#### Scenario: Accept
- **WHEN** the player accepts the tram offer
- **THEN** region load includes +80 kW continuous and the city's growth rate is boosted for the contract term

#### Scenario: Reject and re-offer
- **WHEN** the player rejects and the (seeded) re-offer roll succeeds in the next year
- **THEN** a new offer at 80% of tariff is presented exactly once; a second rejection ends negotiations

### Requirement: Contract obligation binds supply
While an accepted contract runs, its load SHALL count as served-first: unserved contract energy counts double toward dissatisfaction. This SHALL continue to apply after the tram's supply converts to three-phase, measured against the AC side.

#### Scenario: Blackout with contract
- **WHEN** a blackout hour occurs with an active tram contract
- **THEN** dissatisfaction for that hour is weighted double
