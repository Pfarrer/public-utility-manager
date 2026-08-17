## Purpose

Historical narrative and event pressure: the yearly newspaper, an announced-then-active coal price crisis, and the tram company's take-or-leave electricity offer.

## ADDED Requirements

### Requirement: Annual newspaper with historical headlines
For every game year the system SHALL assemble a newspaper containing at least one curated historical headline for that year plus game messages from the closed year.

#### Scenario: Year with entry
- **WHEN** the year 1891 closes and history data has an 1891 entry
- **THEN** the newspaper for 1891 lists that headline

### Requirement: Crisis is announced one year ahead
A coal crisis SHALL be announced in the newspaper of year N (telegraph notice) and its fuel price factor SHALL only apply from year N+1.

#### Scenario: Telegraph then price
- **WHEN** the newspaper of 1893 announces rising tensions and the crisis is scheduled for 1894
- **THEN** fuel price in 1893 is unchanged and in 1894 is multiplied by the crisis factor

### Requirement: Tram offer is decidable
In game year 2 the tram company SHALL offer a contract (80 kW continuous, 70% of tariff, 5 years); the player SHALL accept or reject; acceptance SHALL add the load and contract revenue and boost city growth; rejection SHALL leave the tram buying at normal tariff without growth boost.

#### Scenario: Accept
- **WHEN** the player accepts the tram offer
- **THEN** region load includes +80 kW continuous and the city's growth rate is boosted for the contract term

#### Scenario: Reject and re-offer
- **WHEN** the player rejects and the (seeded) re-offer roll succeeds in the next year
- **THEN** a new offer at 80% of tariff is presented exactly once; a second rejection ends negotiations

### Requirement: Contract obligation binds supply
While an accepted contract runs, its load SHALL count as served-first: unserved contract energy counts double toward dissatisfaction.

#### Scenario: Blackout with contract
- **WHEN** a blackout hour occurs with an active tram contract
- **THEN** dissatisfaction for that hour is weighted double
