## 1. Data & catalog
- [ ] 1.1 `buildings.json`: three-phase generator `alternator-1892` (kind generator, currentType ac) with cost/capacity/lead time/staffing per design.md D1/balancing decision
- [ ] 1.2 `history.json`: extend the 1891 entry (Lauffen→Frankfurt, 2×176 km line, Miller, Dolivo-Dobrowolsky, ~75% efficiency)
- [ ] 1.3 `types.ts`: `CurrentType = 'dc' | 'ac'`, generator schema `currentType`, `tariff: { dc: number; ac: number }`, shares structure `{ dc, ac }` per segment
- requires: power-plant, economy

## 2. Sim core
- [ ] 2.1 `plant.ts`: current type per generator component; derived `plantCurrentType(plant)` (≥1 AC generator → ac)
- [ ] 2.2 `dispatch.ts`: separate reporting of AC/DC capacity (display/adoption condition), one region dispatch remains
- [ ] 2.3 `growth.ts`: separate DC/AC adoption — AC grows only with available AC capacity AND ac tariff ≤ wtp; starts at 0; dc+ac ≤ 1
- [ ] 2.4 `economy.ts`: `setTariffCurrent(state, type, value)`; revenue computation serves both current types (proportional from shares)
- requires: supply-dispatch, regional-growth, economy

## 3. UI
- [ ] 3.1 PlantPanel: alternator with year gate (before 1892 `aria-disabled` + "available from 1892" hint), current-type badge ⎓/~ on the plant entry
- [ ] 3.2 GameShell: second tariff slider (three-phase), visible only from 1892
- [ ] 3.3 CustomerMixPanel: breakdown by current type (⎓/~) per segment; AC=0 hint "Three-phase: no customers yet — lower the tariff or wait"
- [ ] 3.4 DC phase-out toggle "no new DC contracts" (`dcAcceptingNew`, default on) — next to the DC tariff; shows the churn rate only when AC is available AND cheaper
- requires: game-ui

## 4. Persistence & migration
- [ ] 4.1 `persistence.ts`: SAVE_VERSION = 4, `migrateSave` v3→v4 (components → dc, tariff → {dc,ac}, shares → {dc: old, ac: 0}, dcAcceptingNew → true)
- [ ] 4.2 Tests: v4 roundtrip, v3→v4 migration deterministic, version guard stays
- requires: persistence

## 5. Verification
- [ ] 5.1 Suite green, svelte-check 0/0, clean build
- [ ] 5.2 Browser campaign: 1891 newspaper reads, alternator buildable from 1892, AC adoption grows after a tariff cut
- requires: app-scaffold
