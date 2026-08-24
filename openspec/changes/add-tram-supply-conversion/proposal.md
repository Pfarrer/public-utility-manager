# Why

The tram has been a DC customer with a flat 80 kW load and priority tariff (0.7×) since change `add-game-events`. Historically the streetcar remained a DC consumer (600 V DC at the overhead line, to this day), but its **supply** changed: from the 1900s onward, tram companies drew their power no longer from the nearby DC plants but via **substations with rotary converters** from the three-phase long-distance grid (verified: IEEE Power & Energy Magazine, nycsubway.org). For the player this creates a conversion scenario with lead time: the tram announces the switch, the player must build three-phase capacity and a converter station in time.

This change implements sketch D9 from `add-three-phase-power` design.md. Prerequisite: AC shares, alternator, and AC tariff exist (change `add-three-phase-power`).

# What Changes

- **The tram's conversion request:** After `add-three-phase-power` (from the game year in which three-phase is available), the tram company demands conversion of its supply to three-phase with a converter station at a historical cut-off year (data: `history.json` `tramConversion`). The request arrives one year ahead as a message/newspaper article (like the coal-crisis telegraph).
- **Converter station as a building:** New catalog entry `converter-station` (kind converter) with cost, lead time, staffing; exactly one converter station per region is needed. It converts three-phase to 600 V DC for the tram overhead line (efficiency loss on the tram load).
- **The tram load moves to the AC side:** From the cut-off year the tram load (plus converter loss) counts toward AC demand. As long as no converter station is finished and no AC capacity exists, the tram load counts as unserved → tram blackout with double dissatisfaction malus (continuing "Contract obligation binds supply").
- **No rejecting the conversion:** It arrives as historical pressure (like the coal crisis), with a warning one year ahead. The player can only build in time.
- **Save format:** SAVE_VERSION → 5 with migration (stock: tram load stays DC, no converter station present, `tramConversion.phase = 'announced' | 'due'` depending on year).

# Impact

- `specs/game-events/spec.md` — ADDED "Tram conversion demand arrives with the three-phase era" + MODIFIED "Tram offer is decidable" (context: later conversion request)
- `specs/power-plant/spec.md` — ADDED "Converter station is buildable" (catalog, region limit 1)
- `specs/supply-dispatch/spec.md` — ADDED "Tram load moves to AC after conversion" (incl. converter loss, blackout consequences)
- `specs/persistence/spec.md` — MODIFIED "Version guard" (SAVE_VERSION 5, migration v4→v5)
- Implementation: `events.ts` (phase + warning), `buildings.json` (`converter-station`), `dispatch.ts` (tram load on the AC side), `persistence.ts` (v5 + migration)
