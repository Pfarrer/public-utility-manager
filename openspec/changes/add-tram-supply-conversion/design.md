# Design

## Context

The tram is a flat DC load profile (80 kW, priority tariff 0.7×) in `events.ts` (`tramDeal`: offered → active/reoffered, 5-year contract). `history.json` carries the deal parameters. Change `add-three-phase-power` introduces current type on the generator, AC shares, AC tariff, and SAVE_VERSION 4. This change hangs on both content-wise and chronologically: it needs three-phase as an established technology in the game's progress.

Historical anchor: trams remained 600 V DC consumers; the supply side changed. From the 1900s onward, tram companies retired their own steam-driven DC depot plants and bought three-phase energy wholesale from the utility, converting it in rotary-converter substations (AC→DC) on their own premises. Earliest well-documented case: Buffalo, service inaugurated November 15, 1896 — Niagara three-phase stepped up, transmitted ~40 km, rotary converters at the Buffalo Railway Company's Niagara Street station feeding the trolley system; the converters initially ran in parallel with the company's own steam-engine-driven 550 V DC generators (sources: ETHW "Early Electrification of Buffalo"; IEEE Power & Energy Magazine, Sep/Oct 2013 history column). This was a commercial arrangement between the railway and the power company — a deal, not a mandate: economics (coal, boiler crews vs. wholesale AC price) drove it, and the tram's own DC equipment stayed.

This reframes the gameplay: the conversion enters the game as a **decidable offer** to the player, mirroring the original tram deal (`tramDeal`) — same pattern, higher stakes.

This change implements sketch D9 from `add-three-phase-power` design.md. Prerequisite: AC shares, alternator, and AC tariff exist.

## Goals / Non-Goals

**Goals:**
- The tram conversion as a decidable offer (accept/reject), announced via newspaper in the offer year.
- Converter station as a new building (one per region), buildable only after acceptance, with efficiency loss.
- After conversion the tram load moves to the AC side; missing AC supply hits the tram doubly.
- Save v5 with migration.

**Non-Goals:**
- No mandate/no forced conversion: rejection is final and the tram stays a DC customer (no re-offer loop like the original deal — one clean decision).
- No freely negotiable price: the converted supply runs under the AC tariff with the existing tram priority factor (0.7×).
- No overhead-line / network topology, no separate tram lines.
- No new customer segments; the tram stays what it is: a special contract load.

## Decisions

**D1 — Offer year data-driven, not in code.** `history.json` gets a `tramConversion` block (`offerYear`, `converterLossFactor`). Initial: offer 1896 (the Buffalo year — first large-scale rotary-converter supply contract era). Balance tunable via data only, no year branches in code.

**D2 — Converter station = catalog building with region limit, gated on acceptance.** `converter-station` (kind `converter`): converts, does not generate; adds no generation capacity. At most one per region (validation like the `loadScenario` cross-checks). Buildable only while `tramConversion.phase` is `accepted` (or `converted`); the catalog entry stays hidden/disabled before acceptance and after conversion. Operational on completion; staffing implicit like component staffing (read-only).

**D3 — Load migration in dispatch, not in the tram sim.** `tramLoadForRegion()` still yields 80 kW; it carries a `current: 'ac' | 'dc'` attribute (derived from `tramConversion.phase === 'converted'` — set when a converter station is operational, not by calendar). Dispatch sums it onto the respective current-type side; on AC additionally `loadKw / converterEfficiency` (loss ≈ 10%, factor 0.9). Tram blackout (AC side cannot cover it): double dissatisfaction like the existing contract malus.

**D4 — One converter station, one tram.** The play region has exactly one tram (port city, if the deal happened). Region limit 1 suffices; several tram cities would be a later change if the scenario grows.

**D5 — Phase model: `none → offered → accepted → converted`.** `none` before the offer year; `offered` in the offer year (newspaper + decision UI); `accepted` after the player accepts (converter station buildable); `converted` once a converter station is operational (load flips to AC). Rejection from `offered` ends the chain at `none`-behavior permanently (`rejected` terminal state — tram stays DC for the rest of the campaign). Migration v4→v5 derives the phase from year and state: pre-offer-year saves → `none`.

**D6 — Rejection has consequences, but no malus.** A rejected conversion leaves the tram buying DC at the priority tariff — a valid long-term strategy, but it forgoes the AC-era economics: the tram's demand keeps loading the DC side while the province migrates to three-phase (interaction with `dcAcceptingNew` and DC-plant aging is the player's problem, not a scripted punishment).

**D7 — Migration v4→v5.** Only additive fields: `tramConversion: { phase, decidedQuarter? }`, converter station inventory (default: none). No rework of existing fields; the roundtrip stays trivial.

## Risks / Trade-offs

- **Two decidable tram events** (original deal year 2, conversion offer 1896): intended symmetry — the tram bookends the campaign: first as a new load, later as a supply-technology decision.
- **The tram deal ran only until 1896:** If the first contract expires before the conversion offer, the tram keeps drawing as a normal-tariff load (existing behavior). The conversion offer concerns the supply route, not the commercial contract; both coexist.
- **Loss factor flat 10%:** Rotary converters ran at ~85–93% in reality (the whole Buffalo chain measured 79.6% end-to-end). 0.9 as a round data value, tunable via `converterLossFactor`.

## Migration Plan

v4 → v5 additive (D7). The SAVE_VERSION guard stays unchanged; v3/v4 saves keep migrating through the chain.

## Open Questions

- Balancing of `converter-station` (cost/lead time) at implementation; tendency: more expensive than a generator, 2–3 quarters lead time.
- Whether the converted tram should pay AC tariff × 0.7 flat or negotiate a new factor: tendency AC tariff × 0.7 (unchanged priority).
