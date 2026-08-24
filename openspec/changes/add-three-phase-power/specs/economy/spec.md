## MODIFIED Requirements

### Requirement: Revenue from served energy
Quarterly revenue SHALL equal served kWh multiplied by the current tariff ($/kWh), booked as a revenue transaction. Tariff and served energy SHALL be tracked per current type: DC revenue uses the DC tariff, AC revenue uses the AC tariff; both are booked as separate revenue transactions.

#### Scenario: Simple quarter
- **WHEN** 12,000 kWh are served at 0.30 $/kWh
- **THEN** a revenue transaction of 3,600 $ is booked

#### Scenario: Mixed quarter
- **WHEN** 8,000 kWh DC are served at 0.30 $/kWh and 2,000 kWh AC at 0.25 $/kWh
- **THEN** transactions of 2,400 $ (DC) and 500 $ (AC) are booked
