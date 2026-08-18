# demand-profiles Specification

## Purpose
Realistic-feeling electric demand: harmonic load curves shared per customer type, varied per group, aggregated to region-level peak and energy per quarter.

## Requirements

### Requirement: Profiles are harmonic sums
A load profile SHALL be a constant plus a sum of harmonic terms (amplitude, frequency, phase); evaluating a profile at hour h SHALL return non-negative kW for all h in 0..23.

#### Scenario: Daily curve shape
- **WHEN** the household base profile is evaluated across 24 hours
- **THEN** it shows a morning and an evening peak and is non-negative everywhere

### Requirement: Wealth scales level
Wealthier segments SHALL consume more per household; the same base profile evaluated for wealthy, average and poor SHALL return monotonically decreasing levels.

#### Scenario: Ordering by wealth
- **WHEN** daily energy per household is computed for all three wealth categories
- **THEN** wealthy > average > poor

### Requirement: Seeded group jitter
Each settlement- or group-level application of a profile SHALL apply amplitude and phase jitter drawn from the seeded RNG within configured bounds, so identical groups still differ slightly but reproducibly.

#### Scenario: Jitter bounded and reproducible
- **WHEN** jitter is applied twice with the same seed
- **THEN** results are identical, and amplitude stays within ±10% and phase within ±1 hour of the base

### Requirement: Region aggregation
The region demand for a quarter SHALL be the sum over all groups; the system SHALL expose the 24-hour curve, its peak (kW) and its energy (kWh).

#### Scenario: Aggregated peak
- **WHEN** a region with two household groups and one business is aggregated
- **THEN** the curve equals the element-wise sum and peak/energy are derived from it

### Requirement: Industry profile
The business profile SHALL have a high constant base load, a strong work-hours peak and a lunch-time dip relative to the peak.

#### Scenario: Business curve shape
- **WHEN** the business profile is evaluated
- **THEN** values during work hours exceed the base by at least 50% and the 12:00–13:00 value is below the surrounding work-hours values
