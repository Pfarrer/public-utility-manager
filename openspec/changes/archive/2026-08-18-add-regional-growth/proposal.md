## Why

The organic growth loop: reliable and affordable electricity raises electrification; electrification and satisfaction drive household growth and wealth drift. This closes the core M1 feedback cycle (build → serve → grow → more demand).

## What Changes

- Electrification rate per settlement: share of households connected
- Adoption model: grows with coverage (no blackouts) and affordability (tariff vs. willingness-to-pay per wealth segment); stalls/declines otherwise
- Population & wealth drift: slow household growth + segment shift (poor→average→wealthy) driven by electrification and satisfaction over years
- Growth constants data-driven for playtest tuning

## Capabilities

### New Capabilities
- `regional-growth`: electrification adoption plus organic population/wealth growth coupled to supply quality

## Impact

- New `app/src/lib/game/growth.ts`
- Depends on supply-dispatch (reliability), economy (tariff), province-model (segments)
- Feeds back into demand-profiles (more households → higher demand)
