# Proposal: add-city-view

## Why

Player feedback on M1: the UI reads like a dashboard. It shows numbers, but the core fantasy — bringing light to a province — is invisible. There is no sense of electricity flowing or of the city reacting. The sim already tracks per-settlement electrification shares and yearly household growth; none of it is visible.

The city view makes the playable region a place: settlements as abstract polygon footprints on a 1890s-style canvas, plants as animated icons inside the settlement, illumination spreading from running plants, and settlement polygons that grow as households grow.

## What Changes

- New capability `settlement-geometry`: scenario data carries polygon growth stages per settlement (rings keyed by household-count thresholds), valibot-validated; the active stage is derived at render time from current households. Purely presentational.
- New capability `city-view`: a single-region main surface. Settlement polygons render grey; operational plants render as animated icons at deterministic positions inside the polygon; the illuminated area fraction per settlement equals its household-weighted electrification share; blackouts flicker; animated flow lines run from plants to settlements; polygon stages advance as settlements grow.
- `game-ui` (MODIFIED): the province map is re-scoped to a compact region selector; the city view becomes the primary surface; region figures move to a side panel next to it.
- Explicitly out of scope, by decision: NO build-slot system of any kind. Plant building stays unlimited and static as in M1. Geometry and placement introduce no gameplay constraint.

## Impact

- Spec deltas: `settlement-geometry` (ADDED), `city-view` (ADDED), `game-ui` (1 MODIFIED requirement).
- Code: new `CityView.svelte` + `geometry.ts` (stage selection, validation), `province-m1.json` gains `geometry.stages` per settlement, `ProvinceMap.svelte` becomes a selector, `RegionDetail.svelte` moves beside the city view.
- No sim-core changes, no save-format changes (geometry is derived, SAVE_VERSION stays 3).
