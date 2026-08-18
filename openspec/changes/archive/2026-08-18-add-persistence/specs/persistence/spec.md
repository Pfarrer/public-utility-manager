## Purpose

Save, load and autosave the M1 game state with version safety and injectable storage for testability.

## ADDED Requirements

### Requirement: Roundtrip fidelity
Saving a state and loading it back SHALL produce a state deep-equal to the original (including id counters, clock and system states).

#### Scenario: Roundtrip
- **WHEN** a mid-game state is saved and immediately loaded
- **THEN** the loaded state is deep-equal to the saved state

### Requirement: Version guard
Saves with a SAVE_VERSION different from the current one SHALL be rejected with an error naming both versions; corrupt JSON SHALL be rejected likewise.

#### Scenario: Old save
- **WHEN** a save with SAVE_VERSION 0 is loaded by a build with SAVE_VERSION 1
- **THEN** loading throws an error mentioning version 0 and 1

### Requirement: Autosave on year close
The game SHALL autosave after each Q4 settlement completes.

#### Scenario: Autosave
- **WHEN** quarter 4 of 1891 settles
- **THEN** storage contains a save whose clock reads 1892 Q1 — the newest state

### Requirement: Injectable storage
Save/load functions SHALL accept a storage implementing the web Storage interface; the default SHALL be `localStorage` when available and a no-op otherwise.

#### Scenario: In-memory storage
- **WHEN** unit tests pass an in-memory Storage
- **THEN** save/load work without any DOM
