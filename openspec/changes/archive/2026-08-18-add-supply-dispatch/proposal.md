## Why

Matches supply against the aggregated demand curve each quarter: coverage check, blackout on deficit, satisfaction impact from outages. This is the first true gameplay loop feedback (build too small → lights go out → customers unhappy).

## What Changes

- Quarter dispatch: compare available capacity (plant, staffed) against demand curve
- Per-hour coverage: served vs unserved energy; deficit hours cause partial blackout
- Unserved-energy accounting per settlement (or region, M1: region)
- Satisfaction model: falls with outage duration (hours) scaled by era expectation factor; recovers slowly
- Era expectation baseline (M1: early-era, low expectations constant)

## Capabilities

### New Capabilities
- `supply-dispatch`: quarterly supply/demand matching with blackout accounting and satisfaction feedback

## Impact

- New `app/src/lib/game/dispatch.ts`, `satisfaction.ts`
- Depends on demand-profiles (curve), power-plant (capacity), sim-core (tick integration)
- Consumed by economy (billed energy), regional-growth (reliability), game-ui (indicators)
