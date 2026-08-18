# Tasks: remove-employee-management

## 1. Sim core
- [x] 1.1 `types.ts`: remove `crew` from `Plant`; remove `'wages'` from `TransactionKind` and from `AnnualReportTotals`
- [x] 1.2 `plant.ts`: drop `staffing` from component schemas; delete `plantRequiredCrew`, `staffingFactor`, `setCrew`; `plantAvailableCapacity` returns installed capacity of operational components (factor 1)
- [x] 1.3 `economy.ts`: drop `wagePerCrewQuarter` from schema+data load; remove the wages booking and its report totals field
- [x] 1.4 `data/buildings.json`: remove `staffing` fields; `data/economy.json`: remove `wagePerCrewQuarter`
- [x] 1.5 `persistence.ts`: bump `SAVE_VERSION` to 3 with comment `v3: employee management removed`

## 2. UI
- [x] 2.1 `PlantPanel.svelte`: remove the Besatzung row (crew slider, `changeCrew`) and the `setCrew` import; capacity line shows installed capacity
- [x] 2.2 `ReportModal.svelte`: remove the `wages` label entry

## 3. Tests
- [x] 3.1 `plant.test.ts`: remove the `staffing` describe block (required crew, factor, setCrew clamp); capacity tests assert full capacity
- [x] 3.2 `economy.test.ts`: remove wage scenario + `wagePerCrewQuarter` assertions; wage-free quarters assert no `wages` transaction
- [x] 3.3 `dispatch.test.ts` / `events.test.ts` / `persistence.test.ts` / UI tests: remove `crew:` literals and crew testids; full suite green

## 4. Verification & ship
- [x] 4.1 `npm run check` 0 errors, `npm test` green, `npm run build` succeeds
- [x] 4.2 Browser spot-check: plant panel has no crew input; quarter close books no wages; annual report shows no Löhne row
- [x] 4.3 Tick tasks.md, commit `feat(plant): remove employee management` on `spec/remove-employee-management`, push, PR, CI green
- [ ] 4.4 After merge: `openspec archive remove-employee-management -y`, sweep TBD purposes and stale Purpose mentions of staffing/wages (power-plant, economy), `validate --specs --strict`, commit
