# settlement-geometry Specification

## Purpose
TBD - created by archiving change add-city-view. Update Purpose after archive.

## Requirements

### Requirement: Settlements carry polygon growth stages
Each settlement in scenario data SHALL carry a `geometry` object with an ordered list of stages; each stage SHALL define a `minHouseholds` threshold and a closed polygon ring (SVG path in a shared 0–1000 coordinate space); thresholds SHALL be strictly ascending and the first stage SHALL be active at the settlement's starting households.

#### Scenario: Stage thresholds ordered
- **WHEN** settlement geometry with stages `[4000, 6000, 7500]` is validated
- **THEN** validation passes and the first stage is active at 5,400 households

#### Scenario: Broken geometry rejected
- **WHEN** geometry with non-ascending thresholds or an empty path is validated
- **THEN** loading throws a validation error naming the offending field

### Requirement: Active stage derives from current households
The active geometry stage of a settlement SHALL be the last stage whose `minHouseholds` is less than or equal to the settlement's current household count; if none matches, the first stage SHALL be used.

#### Scenario: Stage advance on growth
- **WHEN** a settlement grows from 5,400 to 6,100 households with thresholds `[4000, 6000, 7500]`
- **THEN** the active stage changes from stage 1 to stage 2

#### Scenario: Fallback below all thresholds
- **WHEN** a settlement's households drop below every threshold (edge case)
- **THEN** the first stage is used

### Requirement: Plant anchor positions are deterministic
Each plant SHALL be assigned a display position inside its settlement's polygon, derived deterministically from the settlement id and plant id; different plants within a settlement SHALL receive different positions; the derivation SHALL NOT use randomness at render time.

#### Scenario: Same ids, same position
- **WHEN** the anchor for settlement `city-hafenstadt`, plant 1 is computed twice
- **THEN** both results are identical

#### Scenario: Distinct plants, distinct anchors
- **WHEN** anchors for plants 1, 2 and 3 in `city-hafenstadt` are computed
- **THEN** all three positions are pairwise distinct
