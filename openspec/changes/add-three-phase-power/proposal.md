# Why

Historically, the three-phase breakthrough was not a creeping trend but a dated event: the 1891 International Electrotechnical Exhibition in Frankfurt, where Lauffen→Frankfurt transmitted three-phase power over 176 km at ~75% efficiency (Oskar von Miller, Dolivo-Dobrowolsky/AEG + Oerlikon). The game starts in 1890 — the player experiences the breakthrough **during play**. Until then all plants generate DC (Edison's island-grid era). The switch to three-phase should be felt: not as a toggle, but as new generation capacity built up in parallel, which must win its own customers.

At the same time, change `add-power-origin-transparency` secures the display base: origin lines, current-type badges, and the customer mix panel already exist — this change fills them with mechanics.

# What Changes

- **Newspaper article announces the breakthrough:** The history data receives (already present: "Wunder von Lauffen" 1891) an extended report proclaiming the three-phase breakthrough with real references. The article appears automatically at the 1891→1892 year boundary.
- **Three-phase generators become buildable:** After the article appears (from 1892), the building catalog offers a three-phase generator (alternator). Before that it is grayed out / unavailable. Steam engines stay current-type neutral (they drive both generator types).
- **Current type becomes player control:** Each plant can hold DC and AC generators in parallel. `plant.currentType` already exists as a display field; this change makes current type a property of the **generator** (`componentId` decides), not the plant.
- **Three-phase gets its own tariff:** The player sets a separate three-phase tariff next to the DC tariff ($/kWh, same clamp bounds). Customers "decide": AC adoption grows only if AC capacity is available AND the AC tariff ≤ the segment's willingness to pay.
- **Customers stay on their current type:** Existing DC shares do not migrate automatically. AC shares grow from 0 (their own adoption per segment). Visible in the customer mix panel (breakdown by current type) and on the plants' ⎓/~ badges.
- **Option "no new DC contracts":** The player can stop accepting new DC customers (historically DC remained purchasable in parallel — the phase-out is a player decision). DC adoption freezes; existing customers churn only if AC is available AND cheaper (fixed quarterly rate, "contract run-off").
- **Save format:** SAVE_VERSION → 4 with migration (stock: all generators DC, all shares assigned to DC).

# Impact

- `specs/game-events/spec.md` — MODIFIED "Annual newspaper with historical headlines" (the 1891 Lauffen report proclaims the three-phase breakthrough)
- `specs/power-plant/spec.md` — MODIFIED "Capacity derives from components" + "Expansion actions" (three-phase generator, current type on the generator)
- `specs/regional-growth/spec.md` — MODIFIED "Adoption grows with reliable affordable supply" (AC adoption as its own process)
- `specs/economy/spec.md` — MODIFIED "Revenue from served energy" (separate AC tariff)
- `specs/game-ui/spec.md` — MODIFIED "Player controls work" (three-phase tariff slider) + "Customer mix panel" (breakdown by current type)
- `specs/persistence/spec.md` — MODIFIED "Version guard" + "Roundtrip fidelity" (SAVE_VERSION 4, migration)
- Implementation: `events.ts`/`history.json`, `buildings.json` (alternator), `plant.ts` (current type per component), `growth.ts` (separate DC/AC adoption), `economy.ts` (AC tariff), UI components
