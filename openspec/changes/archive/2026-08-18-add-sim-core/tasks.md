## 1. Types & RNG

- [x] 1.1 Create `types.ts` with `GameState` (clock, cash, seed, id counters) and placeholder system state
- [x] 1.2 Implement `rng.ts` (mulberry32 + createRng/drawFloat/drawInt) pure functions
- [x] 1.3 Unit tests: seed reproducibility, sequence equality

## 2. Clock & Tick

- [x] 2.1 Implement `clock.ts` quarter advance (Q4 → next year Q1)
- [x] 2.2 Implement `sim.ts` `tick(state)` with ordered no-op system placeholders
- [x] 2.3 Unit tests: 4-tick year rollover, replay deep-equality, id assignment from state counters
