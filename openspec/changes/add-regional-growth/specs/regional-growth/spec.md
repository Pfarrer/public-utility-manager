## Purpose

Organic growth loop: households adopt electricity when supply is reliable and affordable; settlements grow and wealth segments drift upward over years under good supply.

## ADDED Requirements

### Requirement: Adoption grows with reliable affordable supply
The share of connected households SHALL increase per quarter when there are no blackouts and the tariff is at or below the wealth segment's willingness-to-pay.

#### Scenario: Good service
- **WHEN** a quarter has no blackout and tariff ≤ willingness-to-pay for a segment
- **THEN** that segment's electrification share increases

### Requirement: Outages and overpricing stall adoption
In quarters with blackouts or tariff above willingness-to-pay, electrification SHALL not increase; with both present it SHALL decrease slightly.

#### Scenario: Expensive unreliable year
- **WHEN** 4 quarters each have blackouts and tariff above willingness-to-pay
- **THEN** the electrification share at year end is lower than at year start

### Requirement: Willingness-to-pay differs by wealth
Wealthy segments SHALL tolerate a higher tariff than average, and average higher than poor; thresholds SHALL come from data.

#### Scenario: Threshold ordering
- **WHEN** willingness-to-pay thresholds are loaded
- **THEN** wealthy > average > poor

### Requirement: Households grow and drift with prosperity
Per game year, settlements SHALL gain households at a base rate modified by electrification and satisfaction; a small share of households SHALL move up one wealth category under high satisfaction.

#### Scenario: Prosperous year
- **WHEN** a year passes with full electrification and satisfaction ≥ 80
- **THEN** total households increased and the wealthy+average share increased
