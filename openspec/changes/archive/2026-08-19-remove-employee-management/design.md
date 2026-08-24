# Design: remove-employee-management

## Context
Crew/staffing is interwoven with the sim core: `Plant.crew` in `types.ts`, `plantRequiredCrew`/`staffingFactor`/`setCrew` in `plant.ts`, the wages booking in `economy.ts`, and the crew input in `PlantPanel.svelte`. User decision: manual crew management adds nothing to the grid simulation — workers and wages stay in the simulation, but staffing becomes a **derived** quantity that follows operational needs (implicit hiring/dismissal).

## Goals
- Zero player interaction for staffing: no crew input, no `setCrew` call path.
- Workers remain visible: staff = Σ staffing of operational components (constructing components hire nobody).
- Wages remain a real quarterly cost position: derivedStaff × wagePerCrewQuarter.
- Available capacity = installed capacity (implicit full staffing, no understaffing states).
- Old saves with player-set `crew` are rejected.

## Non-Goals
- Hiring/firing lag, morale, training or any employee-level simulation depth.
- Balance retuning (payroll magnitude is unchanged for a fully-staffed fleet).

## Decisions
- **D1 — Derivation, not management:** `plantRequiredCrew` survives as the derived-demand function (operational components only) and is re-exported; it feeds both the read-only UI display and the wage bill. `staffingFactor`/`setCrew`/`Plant.crew` are deleted.
- **D2 — Wages from derived staff:** economy books `wages = Σ plantRequiredCrew(operational) × wagePerCrewQuarter`; `wagePerCrewQuarter` (250) stays in economy.json; `staffing` stays in buildings.json (meaning: crew demand per component). Since plants are implicitly fully staffed, a fully-staffed fleet's payroll is identical to before.
- **D3 — Save format:** SAVE_VERSION 2 → 3, no migration (established pattern); the version guard rejects old saves.
- **D4 — UI:** PlantPanel shows the derived staff count read-only ("Belegschaft (automatisch): N"); ReportModal keeps the Löhne row.

## Risks / Trade-offs
- Players can no longer understaff to save wages at a capacity penalty — wages now always follow the operational fleet.
- MODIFIED Requirements must carry over all existing scenario names (validator rule) — staffing scenarios renamed in place.
- Available capacity no longer drops from staffing; only construction lead time limits growth.
