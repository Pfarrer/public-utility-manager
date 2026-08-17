## Why

Supply side of M1: one coal-fired plant built from components (steam engines driving generators). Component model enables incremental expansion, partial outages and realistic staffing — core vision mechanic.

## What Changes

- Building catalog (JSON + zod): component types (steam engine, generator) with capacity, cost, build time, staffing
- Plant entity in game state: components with operational status
- Construction queue: orders complete after 1–2 quarters (per component), costs booked on completion
- Expansion actions: add engine / add generator to existing plant
- Staffing model: required crew scales with installed components

## Capabilities

### New Capabilities
- `power-plant`: component-based coal plant with construction queue, expansion and staffing

## Impact

- New `app/src/lib/game/plant.ts`, `app/src/lib/data/buildings.json`
- Depends on sim-core (ids, clock), economy (costs booked via transaction interface — integration minimal: emit costs)
- Consumed by supply-dispatch (capacity), economy (opex)
