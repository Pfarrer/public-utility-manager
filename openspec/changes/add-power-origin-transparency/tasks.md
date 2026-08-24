## 1. Display: origin & current type
- [x] 1.1 CityView: origin line per settlement — "Strom aus: {plant}" when fed from the grid, "Eigenversorgung" with its own running plant (same nearest-running-plant anchor as the distribution lines)
- [x] 1.2 CityView: current-type badge (⎓/~) on the plant icon, rendered from `plant.currentType` (constant `dc` until change add-three-phase-power)
- [x] 1.3 PlantPanel: add current-type badge to the plant entry
- [x] 1.4 Tests: origin line grid-fed vs. self-supply; badge renders ⎓
- requires: city-view, game-ui

## 2. Customer mix panel
- [x] 2.1 `CustomerMixPanel.svelte`: per settlement household-weighted average + wealthy/average/poor in percent, German number formatting
- [x] 2.2 GameShell: place the panel in the right column below the tariff
- [x] 2.3 Tests: percentages from real shares; household-weighted average; rounding
- requires: game-ui

## 3. Verification
- [x] 3.1 Suite green (vitest), svelte-check 0/0, clean build
- [x] 3.2 Browser spot-check: origin line + badge + customer mix with a running plant
- requires: app-scaffold
