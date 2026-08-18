# Design: remove-employee-management

## Context
Crew/staffing is interwoven with the sim core: `Plant.crew` in `types.ts`, `plantRequiredCrew`/`staffingFactor`/`setCrew` in `plant.ts` (available capacity = installed × staffing factor, also used by `dispatch.ts` via `plantAvailableCapacity`), the wages booking in `economy.ts` (+`wagePerCrewQuarter` in economy.json), the Besatzung input in `PlantPanel.svelte`, `wages` in `TransactionKind` and `ReportModal`, and the staffing value in `buildings.json`.

## Goals
- Grid-relevant behavior stays intact: capacity, construction lead times, dispatch, revenue, fuel costs, satisfaction, growth, events.
- No dead data or dead code left behind (`staffing`, `crew`, `wagePerCrewQuarter`, `wages` kinds fully removed).
- Old saves rejected cleanly (SAVE_VERSION 3, established no-migration pattern).

## Non-Goals
- Re-tuning the economy balance after removing wages (accepted shift; can follow as its own change).
- Touching water/other utilities or any M2 scope.

## Decisions
- **D1 — Capacity without staffing:** `plantAvailableCapacity` = installed capacity of operational components (factor 1). Keep the function as the single capacity source used by dispatch; rename not needed.
- **D2 — Wages removal keeps `TransactionKind` minimal:** delete `'wages'` from the union and from the report totals initialization in `economy.ts`; `ReportModal` label map drops the entry. Existing reports in old saves become incompatible → covered by SAVE_VERSION bump.
- **D3 — SAVE_VERSION 3** (no migration, same pattern as v2): old saves are rejected with the established version-guard error.
- **D4 — Data cleanup:** remove `staffing` from `buildings.json` and `wagePerCrewQuarter` from `economy.json`; remove the valibot fields from the schemas in `plant.ts`/`economy.ts`. (Note: this is a **breaking data change** — the fail-fast loaders throw on old files, which is intended.)
- **D5 — UI:** PlantPanel drops the Besatzung row (slider + label) and `changeCrew`; capacity display shows installed capacity. No replacement control.

## Risks / Trade-offs
- Wages were a recurring cost (~4,500 €/quarter in the spec payroll scenario); removing them makes profitable operation easier. Deliberately out of scope (see Non-Goals); balance change stays visible in the annual report's remaining positions.
- Test sweep is large (plant/economy/dispatch/events/persistence tests reference `crew`/`wages`), but mechanical.
- Save compatibility breaks again (v2→v3) shortly after v2 — accepted, game is in development, no shipped players.
