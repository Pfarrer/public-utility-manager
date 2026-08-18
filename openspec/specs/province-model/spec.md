# province-model Specification

## Purpose
Static world model for M1: a province of four regions with distinct terrain types, one playable region containing settlements whose households are tracked by wealth segment.

## Requirements

### Requirement: Province contains four regions
The province SHALL contain exactly four regions (coast, mountains, highland, farmland), each with a terrain type and a lock flag; in M1 exactly one region SHALL be unlocked.

#### Scenario: M1 scenario load
- **WHEN** the M1 scenario data is loaded and validated
- **THEN** there are 4 regions and exactly 1 has `unlocked: true`

### Requirement: Settlements carry population and wealth segments
Each settlement SHALL have a type (city or village), a name, a population and household counts per wealth category (wealthy, average, poor); the sum of households SHALL be greater than 0.

#### Scenario: Segment consistency
- **WHEN** a settlement is validated
- **THEN** every wealth category has a non-negative household count and total households > 0

### Requirement: Region selectors
The model SHALL expose selectors returning total region population, total households, and households per wealth segment.

#### Scenario: Aggregation
- **WHEN** a region with one city (400 wealthy, 2000 average, 3000 poor) and one village (0, 300, 700) is queried
- **THEN** totals are population-weighted across settlements and segment sums are 400 / 2300 / 3700

### Requirement: Scenario data is schema-validated
Scenario JSON SHALL be validated with valibot at load; invalid data SHALL throw a descriptive error naming the offending field.

#### Scenario: Broken data rejected
- **WHEN** scenario JSON with a negative population is loaded
- **THEN** loading throws a validation error mentioning `population`
