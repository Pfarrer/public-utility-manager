# Why

The tram has been a DC customer with a flat 80 kW load and priority tariff (0.7×) since change `add-game-events`. Historically the streetcar remained a DC consumer (600 V DC at the overhead line, to this day) — what changed around 1900 was its **supply contract**, not its equipment philosophy: tram operators shut down their own steam-and-dynamo depots and bought three-phase energy wholesale from the utility, converted to 600 V DC in rotary-converter substations on their own premises. The best-documented early case is Buffalo 1896: Niagara hydro AC stepped up, transmitted ~40 km, rotary converters at the Buffalo Railway Company's Niagara Street station feeding the trolley system — in parallel with the company's own 550 V DC steam-driven generators during the transition. For the player this creates the same deal-type decision as the original tram offer: a commercial offer the player can accept or reject.

This change implements sketch D9 from `add-three-phase-power` design.md. Prerequisite: AC shares, alternator, and AC tariff exist (change `add-three-phase-power`).

# What Changes

- **The tram's conversion offer (decidable):** From the data-driven offer year (`history.json` `tramConversion.offerYear`, initial 1896 — the Buffalo year), the tram company offers to convert its supply to three-phase with a converter station. The offer arrives as a message/newspaper article (like the coal-crisis telegraph) and **is decidable**: the player can accept or reject. Rejection keeps the tram on DC — it is content with DC; the overhead line stays 600 V DC either way.
- **Converter station as a building:** New catalog entry `converter-station` (kind converter) with cost, lead time, staffing; at most one converter station per region. It converts three-phase AC to 600 V DC for the tram overhead line (efficiency loss on the tram load). It becomes buildable only after the offer is accepted.
- **The tram load moves to the AC side (only after acceptance):** Once a converter station is operational and the conversion takes effect, the tram load (plus converter loss) counts toward AC demand. Without acceptance the tram keeps drawing as the DC load it always was. If a converted tram cannot be served from the AC side, the tram load counts as unserved → tram blackout with double dissatisfaction malus (continuing "Contract obligation binds supply").
- **Save format:** SAVE_VERSION → 5 with migration (stock: tram load stays DC, no converter station present, `tramConversion.phase = 'none' | 'offered' | 'accepted' | 'converted'`).

# Impact

- `specs/game-events/spec.md` — ADDED "Tram conversion offer is decidable" + MODIFIED "Tram offer is decidable" (context: the later conversion offer) + MODIFIED "Contract obligation binds supply" (continues to apply after conversion, measured against the AC side)
- `specs/power-plant/spec.md` — ADDED "Converter station is buildable" (catalog, region limit 1, gated on accepted conversion)
- `specs/supply-dispatch/spec.md` — ADDED "Tram load moves to AC after accepted conversion" (incl. converter loss, blackout consequences)
- `specs/persistence/spec.md` — MODIFIED "Version guard" (SAVE_VERSION 5, migration v4→v5)
- Implementation: `events.ts` (offer + phases), `buildings.json` (`converter-station`), `dispatch.ts` (tram load on the AC side), `persistence.ts` (v5 + migration)
