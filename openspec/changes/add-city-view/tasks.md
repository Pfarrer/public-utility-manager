# Tasks: add-city-view

## 1. Geometry data + derivation
- [x] 1.1 `province-m1.json`: add `geometry.stages` per settlement (ordered rings, `minHouseholds` thresholds, first stage threshold ≤ start households)
- [x] 1.2 `geometry.ts` in `$lib/game`: valibot schema for stages (ring path non-empty string, thresholds strictly ascending, first ≤ settlement start households), load-time validation with field-naming error
- [x] 1.3 `stageFor(settlement, households)`: returns active stage (last with threshold ≤ households; fallback: first stage)
- [x] 1.4 `plantAnchor(settlementId, plantId)`: deterministic position inside the 0–1000 view box via hash; positions for different plant ids within a settlement SHALL differ
- [x] 1.5 Unit tests: stage selection boundaries, schema rejection (non-ascending thresholds, empty path), anchor determinism + pairwise distinctness

## 2. City view component
- [x] 2.1 `CityView.svelte`: SVG canvas (0–1000 view box), paper/sepia styling per design D6
- [x] 2.2 For each settlement: render active-stage polygon (grey fill), name label, population caption
- [x] 2.3 Plant rendering: animated icon (steam engine motif) at `plantAnchor`, visible when the plant has ≥ 1 operational component; under-construction plants render scaffolding state
- [x] 2.4 Illumination: radial warm-yellow gradient per running plant, painted within the settlement polygon (clip-path), area fraction ≈ household-weighted electrification share of the settlement
- [x] 2.5 Blackout: when the quarter's dispatch reports blackout, illumination group flickers/dims (CSS animation)
- [x] 2.6 Flow lines: animated dashed lines (dash-offset animation) from each running plant to the settlement centroid
- [x] 2.7 Stage-up highlight: when a settlement's active stage changes between renders, briefly highlight the polygon (CSS transition)

## 3. Shell integration
- [x] 3.1 `ProvinceMap.svelte` → compact region selector (four regions, lock states, no settlement circles); `selectedRegion` binding unchanged
- [x] 3.2 `GameShell.svelte`: city view as primary surface in the left column, `RegionDetail` beside it in a side panel; demand chart stays
- [x] 3.3 City view testids: `city-canvas`, `city-settlement-{id}`, `city-plant-{plantId}`, `city-stage-highlight`

## 4. Verification
- [x] 4.1 Component tests: polygon present per settlement; plant icon appears when component operational; illumination element exists when share > 0; blackout class present when dispatch.blackout
- [x] 4.2 Visual browser check: grey → yellow as quarters tick; plant animation running; stage-up after growth year; no wrap regressions (PR #6 rules)
- [x] 4.3 `vitest run`, `svelte-check`, `npm run build`, `openspec validate add-city-view --strict`
- [x] 4.4 Spec deltas applied: `settlement-geometry`, `city-view` ADDED; `game-ui` MODIFIED requirement updated
