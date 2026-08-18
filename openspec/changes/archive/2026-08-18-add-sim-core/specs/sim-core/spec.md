## Purpose

Deterministic, save-safe simulation core: quarter clock, central game state, seeded randomness and id management used by all gameplay systems.

## ADDED Requirements

### Requirement: Quarter clock advances deterministically
The clock SHALL advance one quarter per tick; after quarter 4 the year SHALL increment and the quarter SHALL reset to 1.

#### Scenario: Four ticks make a year
- **WHEN** the simulation starts at year 1890 quarter 1 and ticks 4 times
- **THEN** the clock reads year 1891 quarter 1

### Requirement: Seeded RNG is reproducible
The RNG SHALL be a mulberry32 generator seeded from a seed stored in the game state; identical seeds SHALL produce identical number sequences.

#### Scenario: Same seed, same sequence
- **WHEN** two generators are created from the same 32-bit seed
- **THEN** their first 10 drawn numbers are identical

### Requirement: Deterministic replay
Running the simulation with the same initial state and the same player actions SHALL produce identical subsequent states (deep equality).

#### Scenario: Replay equality
- **WHEN** the same initial state is ticked 8 times twice (no actions)
- **THEN** the two resulting states are deep-equal

### Requirement: Ids live in game state
Entity ids SHALL be assigned from monotonic counters stored inside `GameState`, so save/load and replay keep ids stable.

#### Scenario: Ids survive save/load
- **WHEN** a state with entities is serialized and loaded back
- **THEN** the id counter and all entity ids are unchanged and the next assigned id equals counter + 1
