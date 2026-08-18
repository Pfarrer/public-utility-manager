## Context

Vision: first plants tiny (2 engines, 6 generators, few households), growth by components not just new plants. Historical Pearl-Street scale. Deterministic ids and clock from sim-core required.

## Goals / Non-Goals

**Goals:**
- Data-driven component catalog
- Construction queue integrated with quarter clock
- Capacity + staffing outputs ready for dispatch

**Non-Goals:**
- Multiple plant types (hydro, etc.) — later changes
- Fuel efficiency per technology era (fixed M1 efficiency)
- Fires/breakdowns (reliability events come with game-events or later)

## Decisions

- **Engine:generator ratio in data**: each engine type carries `generatorsDriven`; capacity = generators actually backed by operational engines.
- **Booking costs on completion**, not on order — keeps cash timing honest with build time; order carries the reference price.
- **Staffing**: `requiredCrew = Σ component.staffing`; availability factor = staffed/required, clamped to [0,1].

## Risks / Trade-offs

- Booking on completion allows ordering beyond cash — mitigate: orders SHALL be rejected if projected total outstanding costs exceed cash.
- Understaffing as linear factor is crude but transparent; breakdown modeling later.
