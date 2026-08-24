## 1. Data & catalog
- [ ] 1.1 `history.json`: `tramConversion` block (offerYear 1896, converterLossFactor 0.9)
- [ ] 1.2 `buildings.json`: `converter-station` (kind converter, region limit 1, cost/lead time/staffing per design D2 + balancing)
- [ ] 1.3 `types.ts`: converter station types, `tramConversion` phase (`none | offered | accepted | converted | rejected`), tram load `current: 'ac' | 'dc'`
- requires: power-plant, game-events

## 2. Sim core
- [ ] 2.1 `events.ts`: conversion offer in the offer year (newspaper like the coal-crisis telegraph) + accept/reject decision (terminal `rejected`)
- [ ] 2.2 `dispatch.ts`: tram load on the AC side once a converter station is operational (phase `converted`; incl. `loadKw / converterLossFactor`); tram blackout → double-weighted dissatisfaction; phases `none`/`offered`/`accepted`/`rejected` keep the tram on DC
- [ ] 2.3 Converter station operation: finished construction = operational (flips phase to `converted`); implicit staffing like components (read-only)
- requires: supply-dispatch, game-events

## 3. UI
- [ ] 3.1 Plant panel / catalog: `converter-station` orderable only in phase `accepted`; grayed out with a hint otherwise
- [ ] 3.2 Messages / newspaper: render the offer article (like the coal telegraph); decision buttons accept/reject
- [ ] 3.3 GameShell: conversion status display (phase + converter station status) in the event display
- requires: game-ui

## 4. Persistence & migration
- [ ] 4.1 `persistence.ts`: SAVE_VERSION = 5, migration v4→v5 (additive: tramConversion phase derived from year — pre-offer-year → `none` —, converter station inventory defaulting to none)
- [ ] 4.2 Tests: v5 roundtrip, v4→v5 migration, version guard stays
- requires: persistence
