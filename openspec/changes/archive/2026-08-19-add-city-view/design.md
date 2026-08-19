# Design: add-city-view

## Context

The sim already owns the truth: `GrowthState.shares[settlementId][segment]` (electrification) and `GrowthState.households` (yearly growth, mutated by `yearlyGrowth`). Any geometry must be derived from these, not stored alongside them, or we fork the truth and bump the save format for a visual feature.

## Goals

- A single-region main surface that feels like a place, not a table.
- Illumination and growth visible at a glance, driven by real sim state.
- Zero sim-core changes; zero save-format changes.
- Deterministic rendering (no layout RNG at render time) so tests can pin positions.

## Decisions

### D1: Geometry as scenario data, stage selected by household count

Each settlement gets `geometry.stages`: an ordered list of rings (SVG path strings in a 0–1000 view box), each with a `minHouseholds` threshold. The active stage is the last stage whose threshold is ≤ current households. Selecting is pure derivation — `stageFor(settlement, households)` — and households already live in the save. No state duplication.

### D2: Illumination is a display fraction, not a sim radius

The yellow area is the visualization of the household-weighted electrification share, painted as a radial gradient ring around each running plant. How the yellow is painted never feeds back into the sim. This deliberately avoids modelling supply radius, line topology or voltage in M2a.

### D3: Plant placement is deterministic hashing

Plant icons sit at fixed, reproducible positions inside the settlement polygon derived from plant id (hash), not RNG and not player placement. Rationale: no build-slot system is wanted (decision from the proposal), and free placement would create a slot system in disguise (positions would become gameplay). A stable hash keeps saves consistent across reloads and tests deterministic.

### D4: Growth stages are cosmetic checkpoints, not content gates

Advancing a stage unlocks nothing. No new build options, no capacity, no slots — the stage list exists so growth has a face. A stage-up is noticeable (a short highlight animation on the changed polygon) but purely celebratory.

### D5: Blackout flicker as the under-supply signal

When the region's dispatch reports a blackout quarter, illumination dims and flickers via CSS animation on the SVG group. Historic resonance (brown-out dimming around 1900) at trivial cost. The demand chart remains the precise instrument; the city view carries the mood.

### D6: Aesthetic: 1890s print

Paper-toned canvas, sepia linework, warm glow yellow. The newspaper already established this aesthetic; the city view extends it from a document to a place.

## Trade-offs / Risks

- **Path data authoring**: hand-authored SVG paths for ~5 settlements × 3 stages. Cost is bounded; a helper comment in the JSON documents the coordinate space. If paths prove tedious later, a smoothing tool can generate them from control points — out of scope here.
- **Stage thresholds vs. balance**: thresholds must sit above M1 starting households so growth is actually visible in a campaign (e.g. city starts at 5,400 households, stages at 6,000 / 7,500). To be tuned with `growth.json` numbers in tasks.
- **Deterministic hash placement could overlap visually** for many plants; acceptable at M2a plant counts (handful per settlement), revisit if plant counts grow an order of magnitude.
- **Flow lines from plant to polygon centroid** are an abstraction (no real grid topology); fine for mood, not an instrument.

## Migration Plan

None needed. Geometry lives in scenario JSON only; the save keeps SAVE_VERSION 3.

## Open Questions

- Should the illuminated fraction follow the *region* electrification or the *settlement-weighted* share? Decided: settlement-weighted (per-settlement shares exist and are more local). Revisit only if per-settlement adoption diverges wildly from region feel.
