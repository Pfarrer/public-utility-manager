## 1. Data & catalog
- [ ] 1.1 `history.json`: `tramConversion` block (announceYear 1896, dueYear 1897, converterLossFactor 0.9)
- [ ] 1.2 `buildings.json`: `converter-station` (kind converter, region limit 1, cost/lead time/staffing per design D2 + balancing)
- [ ] 1.3 `types.ts`: converter station types, `tramConversion` phase (announced/due), tram load `current: 'ac' | 'dc'`
- requires: power-plant, game-events

## 2. Sim core
- [ ] 2.1 `events.ts`: conversion warning as a message in the announce year (like the coal-crisis telegraph)
- [ ] 2.2 `dispatch.ts`: tram load on the AC side from the due year (incl. `loadKw / converterLossFactor`); tram blackout → double-weighted dissatisfaction
- [ ] 2.3 Converter station operation: finished construction = operational; implicit staffing like components (read-only)
- requires: supply-dispatch, game-events

## 3. UI
- [ ] 3.1 Plant panel / catalog: `converter-station` buildable; grayed out with a hint when one already exists
- [ ] 3.2 Messages / newspaper: render the warning article (like the coal telegraph)
- [ ] 3.3 GameShell: no new control lever; conversion status display (announced/due + converter station status) in the event display
- requires: game-ui

## 4. Persistence & migration
- [ ] 4.1 `persistence.ts`: SAVE_VERSION = 5, migration v4→v5 (additive: tramConversion phase derived from year, converter station inventory defaulting to none)
- [ ] 4.2 Tests: v5 roundtrip, v4→v5 migration, version guard stays
- requires: persistence
