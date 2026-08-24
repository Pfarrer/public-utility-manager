## MODIFIED Requirements

### Requirement: Version guard
Saves with a SAVE_VERSION different from the current one SHALL be rejected with an error naming both versions; corrupt JSON SHALL be rejected likewise. Older saves SHALL be migrated instead of rejected: SAVE_VERSION 3 saves are migrated (every generator treated as DC, the single tariff becomes both the DC and AC tariff, every segment share becomes `{ dc: oldShare, ac: 0 }`), SAVE_VERSION 4 saves are migrated additively (tram conversion phase derived from the game year — pre-offer-year saves map to `none` —, converter station inventory defaulting to none).

#### Scenario: Old save
- **WHEN** a save with SAVE_VERSION 0 is loaded by a build with SAVE_VERSION 1
- **THEN** loading throws an error mentioning version 0 and 1

#### Scenario: v3 save migrates
- **WHEN** a v3 save with tariff 0.30 and a wealthy share of 0.71 is loaded by a v4 build
- **THEN** the loaded state has tariffs { dc: 0.30, ac: 0.30 } and wealthy share { dc: 0.71, ac: 0 }

#### Scenario: v4 save migrates
- **WHEN** a v4 save from game year 1895 without a converter station is loaded by a v5 build
- **THEN** the loaded state has tram conversion phase `none` and no converter station

### Requirement: Roundtrip fidelity
Saving a state and loading it back SHALL produce a state deep-equal to the original (including id counters, clock, system states, and the tram conversion phase).

#### Scenario: Roundtrip
- **WHEN** a mid-game state is saved and immediately loaded
- **THEN** the loaded state is deep-equal to the saved state
