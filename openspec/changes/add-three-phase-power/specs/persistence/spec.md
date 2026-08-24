## MODIFIED Requirements

### Requirement: Version guard
Saves with a SAVE_VERSION different from the current one SHALL be rejected with an error naming both versions; corrupt JSON SHALL be rejected likewise. Saves with SAVE_VERSION 3 SHALL be migrated to the current version on load instead of rejected: every generator is treated as DC, the single tariff becomes both the DC and AC tariff, and every segment share becomes `{ dc: oldShare, ac: 0 }`.

#### Scenario: Old save
- **WHEN** a save with SAVE_VERSION 0 is loaded by a build with SAVE_VERSION 1
- **THEN** loading throws an error mentioning version 0 and 1

#### Scenario: v3 save migrates
- **WHEN** a v3 save with tariff 0.30 and a wealthy share of 0.71 is loaded by a v4 build
- **THEN** the loaded state has tariffs { dc: 0.30, ac: 0.30 } and wealthy share { dc: 0.71, ac: 0 }

### Requirement: Roundtrip fidelity
Saving a state and loading it back SHALL produce a state deep-equal to the original (including id counters, clock and system states).

#### Scenario: Roundtrip
- **WHEN** a mid-game state is saved and immediately loaded
- **THEN** the loaded state is deep-equal to the saved state
