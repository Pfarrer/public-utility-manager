## Why

All gameplay systems need one deterministic quarter-based simulation core: shared game state, clock (1 tick = 1 quarter), seeded RNG and id management. Defining it first keeps every later system testable in isolation.

## What Changes

- Introduce framework-free game state type (`GameState`) with clock (year, quarter), cash, seed and id counters
- Implement seeded RNG (mulberry32) whose sequence is derived from the seed stored in state
- Implement quarter advance: 4 quarters per year, year increments after Q4
- All entity ids SHALL be assigned from counters inside `GameState` (no module-level counters)
- Tick orchestration skeleton with extension points for later systems

## Capabilities

### New Capabilities
- `sim-core`: deterministic quarter-based simulation core — clock, state, seeded randomness, id management

## Impact

- New `app/src/lib/game/` modules: `types.ts`, `rng.ts`, `clock.ts`, `sim.ts`
- Foundation consumed by every later gameplay change; no UI yet
