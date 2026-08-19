# Proposal: remove-employee-management

## Why
The manual crew/staffing system (player-settable crew level, understaffing factor, crew input) adds micro-management that does not add anything to the grid simulation. Workers and wages remain part of the simulation, but they are hired and dismissed implicitly based on operational needs.

## What Changes
- Remove the player-facing staffing controls (`setCrew`, crew input, `Plant.crew`).
- Keep workers in the simulation as a derived quantity: staff = Σ staffing of operational components (engines and generators); constructing components hire nobody yet, completed components hire, removal dismisses.
- Keep wages as a quarterly cost position: staff × wage per crew quarter (data-driven).
- `plantAvailableCapacity` equals installed capacity (plants are implicitly fully staffed).
- SAVE_VERSION bump to 3 (old saves with player-set `crew` are rejected).

## Capabilities
### Modified Specs
- `power-plant`: "Staffing follows components implicitly" replaces player-settable staffing.
- `economy`: "Wages from derived staff" books wages from the derived crew total.
- `game-ui`: "Player controls work" without a staffing input; staff shown read-only.

## Impact
- Breaking save change (v3 rejects v1/v2 saves), breaking data change (`staffing` semantics move from player budget to derived demand; `wagePerCrewQuarter` stays).
- No balance retuning in this change.
