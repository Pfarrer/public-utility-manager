## Purpose

Quarterly matching of available generation against the demand curve: what got served, what blacked out, and how outages move customer satisfaction.

## ADDED Requirements

### Requirement: Hourly coverage accounting
For each hour of the quarter's representative day, served energy SHALL be min(demand, available capacity); the difference SHALL be recorded as unserved energy.

#### Scenario: Deficit hour
- **WHEN** demand is 120 kW at hour 19 and available capacity is 100 kW
- **THEN** 100 kW is served and 20 kW recorded unserved for that hour

### Requirement: Blackout declared on deficit
A quarter with any unserved energy SHALL be flagged as blackout quarter with its total unserved kWh stored for downstream systems.

#### Scenario: Blackout flag
- **WHEN** a quarter accumulates 150 kWh unserved
- **THEN** the quarter result carries `blackout: true` and `unservedKwh: 150`

### Requirement: Satisfaction falls with outage duration
Satisfaction (0–100) SHALL decrease proportionally to unserved hours scaled by an era expectation factor; early-era factor SHALL be low (outages tolerated).

#### Scenario: Early-era outage
- **WHEN** 3 of 24 hours are unserved in the early era
- **THEN** satisfaction decreases by a small, non-zero amount derived from the era factor

### Requirement: Satisfaction recovers slowly
Satisfaction SHALL recover by a fixed small rate per quarter without outages, capped at 100.

#### Scenario: Recovery
- **WHEN** satisfaction is 70 and 4 outage-free quarters pass
- **THEN** satisfaction increased by 4 × recovery rate and did not exceed 100
