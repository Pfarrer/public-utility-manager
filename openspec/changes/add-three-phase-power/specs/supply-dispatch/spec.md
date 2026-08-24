## ADDED Requirements

### Requirement: Dispatch pools are separated by current type
DC and AC SHALL be dispatched as separate physical networks: DC demand SHALL be served from DC capacity only and AC demand from AC capacity only. Per quarter and region, served and unserved energy SHALL be recorded per pool (`dcServedKwh`, `acServedKwh`, `dcUnservedKwh`, `acUnservedKwh`) plus per-pool demand peaks. The quarter's totals (`servedKwh`, `unservedKwh`, `peakKw`, `blackout`) SHALL equal the union of both pools.

#### Scenario: No cross-supply
- **WHEN** AC-connected households demand energy and the region has DC capacity but no AC capacity
- **THEN** that AC demand is recorded as unserved on the AC pool and the DC pool is unaffected

#### Scenario: Separate pools add up
- **WHEN** a quarter serves 8,000 kWh from the DC pool and 2,000 kWh from the AC pool
- **THEN** the quarter reports `servedKwh: 10,000` with `dcServedKwh: 8,000` and `acServedKwh: 2,000`

#### Scenario: Blackout on one pool
- **WHEN** the AC pool has unserved energy while the DC pool serves all its demand
- **THEN** the quarter is flagged as blackout and AC-side outage hours count toward dissatisfaction
