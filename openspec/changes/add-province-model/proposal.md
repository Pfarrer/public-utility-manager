## Why

The game world is a province of four regions (coast, mountains, highland, farmland) containing settlements with wealth-segmented households. M1 makes exactly one region playable; the model must exist before demand, supply and growth can reference it.

## What Changes

- Introduce region and settlement types (city/village, population, wealth segments)
- Static M1 scenario data (JSON + zod): 4 regions, one playable (`unlocked`), 3 locked
- Playable region contains 1 city + 1 village with households per wealth category
- Selector helpers: region population, households by segment, per-settlement stats

## Capabilities

### New Capabilities
- `province-model`: province/region/settlement world model with wealth-segmented households and lock state

## Impact

- New modules `app/src/lib/game/province.ts`, `app/src/lib/data/province-m1.json`, zod schema
- Consumed by demand profiles, growth, UI map
