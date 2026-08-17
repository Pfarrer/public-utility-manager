## Context

Framework-free core per README decision. Lessons from the predecessor project: module-level id counters break determinism/save-load; `-0` poisoning breaks deep-equality after JSON roundtrips; RAF accumulator loop for UI timing lives in the UI layer, not the core.

## Goals / Non-Goals

**Goals:**
- Pure `step(state) -> state` tick function (immutably cloned or safely mutated then returned)
- Determinism: same input + actions ⇒ same output
- Save-serializable state (plain JSON)

**Non-Goals:**
- Any domain logic (demand, plants, economy — later changes)
- UI integration, game loop timing

## Decisions

- **mulberry32**: small, fast, well-understood; 32-bit seed stored in state; draw functions pure by passing an RNG state object.
- **Immutable-ish tick**: `tick(state)` deep-clones state, mutates the clone, returns it — simplest correct determinism story for M1.
- **Extension points**: ordered system calls inside `tick()` (construction → demand → dispatch → growth → economy), each a no-op placeholder until its change lands.

## Risks / Trade-offs

- Deep-clone per tick costs performance; fine for 40-tick games with small state. Revisit if state grows.
- Float accumulation across many ticks can drift — normalize monetary values (`+ 0`) before storing, round money to cents.
