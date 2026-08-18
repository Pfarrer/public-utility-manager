# Proposal: remove-employee-management

## Why
The crew/staffing system (required crew per component, player-settable crew level, understaffing capacity factor, quarterly wage bill) adds micro-management that does not touch the grid simulation itself — plant capacity is already fully determined by the installed operational components. Removing it simplifies the core loop without losing grid depth.

## What Changes
- **BREAKING** Remove staffing from power plants: required crew, player-settable crew and the understaffing capacity factor are deleted; available capacity equals the installed capacity of operational components.
- **BREAKING** Remove wage costs: no wages transaction, no `wagePerCrewQuarter` balance value, the annual report no longer lists a wages position.
- Remove the staffing level input (Besatzung) from the plant panel UI.
- **BREAKING** Bump SAVE_VERSION to 3: existing saves that still carry crew/wage data are rejected by the version guard (no migration, established pattern).
- Catalog data loses the `staffing` field per component.

## Capabilities

### Modified
- `power-plant`: remove the "Staffing scales with components" requirement
- `economy`: remove the "Wages from staffed crew" requirement
- `game-ui`: drop the staffing level input from "Player controls work"

## Impact
- Sim core (`types.ts`, `plant.ts`, `economy.ts`, `persistence.ts`), data (`buildings.json`, `economy.json`), UI (`PlantPanel`, `ReportModal`), and the affected tests.
- Balance shift: wages were a recurring cost position; removing them makes operation more profitable. Accepted for now — re-tuning is explicitly out of scope and can follow as its own change if the game becomes too easy.
