# Tasks: remove-employee-management

## 1. Sim core
- [x] 1.1 `types.ts`: remove `crew` from `Plant`; keep `'wages'` in `TransactionKind`/`AnnualReportTotals`
- [x] 1.2 `plant.ts`: keep component `staffing` schemas and `plantRequiredCrew` (derived demand, operational components only); delete `staffingFactor` and `setCrew`; `plantAvailableCapacity` returns installed capacity
- [x] 1.3 `economy.ts`: keep `wagePerCrewQuarter` in schema+data; wages booking uses derived staff (Σ operational staffing across plants)
- [x] 1.4 `data/*`: no field changes — `staffing` (buildings.json) and `wagePerCrewQuarter` (economy.json) stay
- [x] 1.5 `persistence.ts`: `SAVE_VERSION` = 3 with comment `v3: staffing derived implicitly, no player-set crew`

## 2. UI
- [x] 2.1 `PlantPanel.svelte`: remove the crew input row; add read-only staff display (`Belegschaft: N Arbeiter (automatisch)`)
- [x] 2.2 `ReportModal.svelte`: Löhne row stays (verify)

## 3. Tests
- [x] 3.1 `plant.test.ts`: derived-demand tests — `plantRequiredCrew` counts operational components only; constructing components hire nobody
- [x] 3.2 `economy.test.ts`: wages booked from derived staff; wage-free quarter (no operational components) books no wages
- [x] 3.3 `dispatch.test.ts`/`events.test.ts`/`persistence.test.ts`/UI tests: no `crew` literals; version guard uses SAVE_VERSION dynamically; UI test asserts no crew input + read-only staff display
- [x] 3.4 Full suite green

## 4. Verification & ship
- [x] 4.1 `npm run check` 0 errors, `npm test` green, `npm run build` succeeds
- [x] 4.2 Browser spot-check: read-only staff display, no input; quarter close books wages; annual report shows the Löhne row
- [x] 4.3 Tick tasks.md, commit on `spec/remove-employee-management`, push (PR #3 updates)
- [x] 4.4 After merge: `openspec archive remove-employee-management -y`, sweep stale Purpose mentions of player-set staffing, `validate --specs --strict`, commit
