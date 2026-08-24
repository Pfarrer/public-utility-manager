# Design

## Context

Sim core and display are deliberately separated: the core aggregates demand and capacity **per region** (`runDemand`/`runDispatch`), electrification runs **per settlement** (`GrowthState.shares[settlementId][segment]`). The M2a city view renders this truth only partially: light exists solely around the anchor of a running plant hash-assigned to the settlement. Settlements without their own plant stay visually dark forever.

## Goals / Non-Goals

**Goals:**
- Display consistency: light = the settlement's true electrification share, fed from the regional grid.
- A visible grid: animated distribution lines from the running plant to every supplied settlement.
- Zero sim core change, zero save change, zero new game mechanics.

**Non-Goals:**
- Line building as a player lever (cost, lead time, topology) — deliberately out of scope; a separate later change if you want lines as an economic good.
- Grid capacity limits or transmission losses — there remains exactly one region dispatch.
- Inter-regional interconnection.

## Decisions

**D1 — Grid state instead of plant presence.** The condition for light becomes: at least one operational plant in the region (`plantAvailableCapacity > 0`, aggregated across the region's plants). That is exactly the condition under which the core serves demand at all — the display stops being stricter than the simulation.

**D2 — Light around the settlement center, not the plant anchor.** The glow circle now sits on the settlement centroid (radius still √share·maxR, clipped to the polygon). Rationale: the light represents *household-weighted electrification*, and households live in the settlement, not in the plant. The plant icon stays at its anchor — plant and illumination are two layers.

**D3 — Distribution lines as the grid visualization.** For every settlement with a lit fraction > 0, a `flow` line runs from the nearest running plant anchor to the settlement centroid (animated via dash offset as before). Multiple plants: each settlement picks the geometrically nearest one — deterministic, no new data. Settlements without adopted households (share ≈ 0) get no line: no power flows, nothing to draw.

**D4 — No new data, no migration.** All information already exists in the `GameState` (shares, households, plants, dispatch). `SAVE_VERSION` stays 3; old saves render correctly immediately.

## Risks / Trade-offs

- **"Why does the village glow without a line?"** — Counter-question: why does its electrification share grow without a line? Both follow the same abstraction (region = network). Whoever wants real lines needs the later change; the distribution lines at least make today's abstraction visible.
- **Nearest-plant selection with multiple plants** can look geometrically unintuitive with hash-placed anchors. Accepted: it is display, not topology; with real line building the player decides this anyway.

## Migration Plan

None. Display-only change; no save format, no data model, no balancing touched.

## Open Questions

- None. (Line building as a lever remains noted as a possible follow-up change.)
