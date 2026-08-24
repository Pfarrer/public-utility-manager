# Design

## Context

The sim core strictly separates display from simulation. The user's transparency request — where does the power come from, which current type, which customer draws what — concerns only the display layer: all data already exists in the `GameState` (`construction.plants`, `growth.shares[settlementId][segment]`, `growth.households`, the `dispatch` result). Since change `region-grid-lighting`, the city view already draws distribution paths (nearest running plant anchor → lit settlement centroid). What is missing is the verbal/numeric layer.

## Goals / Non-Goals

**Goals:**
- The player sees, per settlement, which plant supplies it (or self-supply).
- The player sees the generated current type (⎓/~) at every plant.
- The player sees the adoption share in percent per settlement and wealth segment.
- Display is stable across save/load (SAVE_VERSION 3, no migration).

**Non-Goals:**
- Introducing current types as mechanics (DC/AC capacity split, separate tariffs) — change `add-three-phase-power`.
- Site selection / line building — a separate later change.
- Converter stations / customer migration as mechanics.

## Decisions

**D1 — Origin line instead of a second line layer.** The distribution lines already show the topology spatially. For the verbal layer, one line per settlement in the city view suffices (below the settlement name): "Strom aus: Hafenstadt-Werk" or "Eigenversorgung". It uses the same nearest-running-plant anchor as the lines (one truth, two representations).

**D2 — Current-type badge on the plant, historically correct.** Until AC exists, all generators are DC ("dynamo"). The badge shows ⎓; the AC case (~) activates with change `add-three-phase-power`, without this component containing any AC logic yet — it renders `plant.currentType` (default `dc`), which the core extends in change 2.

**D3 — Customer mix panel as its own component.** `CustomerMixPanel.svelte` renders per settlement: household-weighted average plus wealthy/average/poor in percent. Data sources are `growth.shares` + `growth.households`. The component is a pure function of the game state — placed in the right column below the tariff panel (like RegionDetail).

**D4 — Percentages from real shares, not rounded guesses.** `Math.round(share * 100)` per segment; the average household-weighted from `settlementHouseholds`. Display uses German number formatting (comma) via `toLocaleString('de-DE')`.

## Risks / Trade-offs

- **Two places show the current type** (city-view badge + plant panel): accepted — different contexts (map vs. management), same data source `plant.currentType`, no drift risk because both render the same derived value.
- **Origin line without real topology:** As long as the region is one network, "nearest running plant" is a display convention, not physical topology. With real line building, the line becomes topology-based. Until then it is honest ("Strom aus: plant X" = the plant whose line is drawn).

## Migration Plan

None. Display-only change; no save format, no data model, no balancing touched. After change `add-three-phase-power` is implemented, its implementation extends the customer mix panel with the current-type breakdown (its own delta requirement there).

## Open Questions

- None within this scope. (Current-type mechanics, three-phase pricing, customer choice = change `add-three-phase-power`.)
