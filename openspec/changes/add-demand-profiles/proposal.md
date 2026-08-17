## Why

Electric demand is modeled as harmonic (Fourier-style) load curves per customer group: a shared base curve with per-group amplitude/phase variation, plus an industry profile. This is the vision's core demand mechanic and feeds dispatch, economy and growth.

## What Changes

- Load profile format: constant base term + k harmonic terms (amplitude, frequency, phase), data-driven JSON + zod
- Household profiles per wealth category (level scales with wealth)
- Seeded per-group amplitude/phase jitter within configured bounds
- Industry/business profile: high base load, work-time peak, lunch dip
- Aggregation: region quarter demand curve (24 hourly samples) → peak kW and energy kWh

## Capabilities

### New Capabilities
- `demand-profiles`: harmonic load-curve model with per-group variation and region-level aggregation

## Impact

- New `app/src/lib/game/demand.ts`, `app/src/lib/data/profiles.json`
- Depends on sim-core (seeded RNG), province-model (household groups)
- Consumed by supply-dispatch, economy, game-ui (charts)
