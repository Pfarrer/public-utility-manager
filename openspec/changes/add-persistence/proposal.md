## Why

A 40-quarter game needs saving. localStorage-based save/load with version guard, autosave each game year, and clear-save — proven minimal pattern from the predecessor.

## What Changes

- `saveGame`/`loadGame`/`clearSave`/`hasSave` with injectable storage
- SAVE_VERSION constant; mismatched or corrupt saves rejected with clear error
- Autosave on year close (Q4 settlement), manual save/clear in UI
- Roundtrip guarantee: loaded state deep-equals saved state

## Capabilities

### New Capabilities
- `persistence`: versioned save/load with autosave and injectable storage

## Impact

- New `app/src/lib/game/persistence.ts`
- Depends on sim-core (state shape)
- UI gains save/clear buttons (game-ui integration minimal)
