## 1. Types & RNG

- [ ] 1.1 Create `types.ts` with `GameState` (clock, cash, seed, id counters) and placeholder system state
- [ ] 1.2 Implement `rng.ts` (mulberry32 + createRng/drawFloat/drawInt) pure functions
- [ ] 1.3 Unit tests: seed reproducibility, sequence equality

## 2. Clock & Tick

- [ ] 2.1 Implement `clock.ts` quarter advance (Q4 → next year Q1)
- [ ] 2.2 Implement `sim.ts` `tick(state)` with ordered no-op system placeholders
- [ ] 2.3 Unit tests: 4-tick year rollover, replay deep-equality, id assignment from state counters
