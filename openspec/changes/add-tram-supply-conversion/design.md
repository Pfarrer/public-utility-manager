# Design

## Context

The tram is a flat DC load profile (80 kW, priority tariff 0.7×) in `events.ts` (`tramDeal`: offered → active/reoffered, 5-year contract). `history.json` carries the deal parameters. Change `add-three-phase-power` introduces current type on the generator, AC shares, AC tariff, and SAVE_VERSION 4. This change hangs on both content-wise and chronologically: it needs three-phase as an established technology in the game's progress.

Historical anchor: trams remained 600 V DC consumers; from around 1900–1910 substations with rotary converters (AC→DC) fed them from the three-phase grid. The overhead line stayed DC, the energy now came from afar.

## Goals / Non-Goals

**Goals:**
- The tram conversion as an announced, unavoidable event with build lead time.
- Converter station as a new building (one per region), with efficiency loss.
- The tram load moves to the AC side; missing AC supply hits the tram doubly.
- Save v5 with migration.

**Non-Goals:**
- No freely negotiable request (no accept/reject like the tram deal; historical pressure).
- No overhead-line / network topology, no separate tram lines.
- No new customer segments; the tram stays what it is: a special contract load.

## Decisions

**D1 — Cut-off year data-driven, not in code.** `history.json` gets a `tramConversion` block (`announceYear`, `dueYear`, `converterLossFactor`). Initial: announce 1896, due 1897 (after the tram's first contract in game year 2 ≈ 1891 + 5-year term; the Niagara era as historical reference for "long-distance supply becomes the norm"). Balance tunable via data only, no year branches in code.

**D2 — Converter station = catalog building with region limit.** `converter-station` (kind `converter`): converts, does not generate; adds no generation capacity. At most one per region (validation like the `loadScenario` cross-checks). Operational on completion; staffing implicit like component staffing (read-only).

**D3 — Load migration in dispatch, not in the tram sim.** `tramLoadForRegion()` still yields 80 kW; newly it carries a `current: 'ac' | 'dc'` attribute (from `state.clock.year >= dueYear`). Dispatch sums it onto the respective current-type side; on AC additionally `loadKw / converterEfficiency` (loss ≈ 10%, factor 0.9). Tram blackout (AC side cannot cover it): double dissatisfaction like the existing contract malus.

**D4 — One converter station, one tram.** The play region has exactly one tram (port city, if the deal happened). Region limit 1 suffices; several tram cities would be a later change if the scenario grows.

**D5 — Migration v4→v5.** Only additive fields: `tramConversion: { phase: 'announced' | 'due' }` (derived from year), converter station inventory (default: none). No rework of existing fields; the roundtrip stays trivial.

## Risks / Trade-offs

- **Doubled event load in the annual event system** (coal crisis 1894, tram conversion 1897): manageable, both are independent machines with their own phase. The temporal proximity is intended: 1894 coal price spike, 1897 conversion pressure — the decade stays demanding.
- **The tram deal ran only until 1896:** If the first contract expires before the conversion is due, the tram keeps drawing as a normal-tariff load (existing behavior). The conversion concerns the supply, not the contract.
- **Loss factor flat 10%:** Rotary converters ran at ~85–93% in reality. 0.9 as a round data value, tunable via `converterLossFactor`.

## Migration Plan

v4 → v5 additive (D5). The SAVE_VERSION guard stays unchanged; v3/v4 saves keep migrating through the chain.

## Open Questions

- Balancing of `converter-station` (cost/lead time) at implementation; tendency: more expensive than a generator, 2–3 quarters lead time.
- Whether the tram keeps its priority tariff (0.7×) after conversion or needs its own AC tram tariff: tendency unchanged 0.7× on the respective current-type tariff.
