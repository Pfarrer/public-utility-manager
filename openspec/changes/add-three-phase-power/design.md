# Design

## Context

The sim core tracks electrification shares per settlement and wealth segment (`growth.shares[settlementId][segment]`). Since change `add-power-origin-transparency`, the UI shows current-type badges and a customer mix panel. The history data already contains an 1891 entry ("Wunder von Lauffen"). SAVE_VERSION is 3.

## Goals / Non-Goals

**Goals:**
- Three-phase power as a dated historical event (1891 newspaper article, availability from game year 1892).
- Three-phase generators buildable in parallel with DC; current type is a property of the generator.
- A separate three-phase tariff; AC adoption as its own slow process starting from zero.
- Save migration v3 → v4.
- Display (badges, customer mix) shows the current-type breakdown.

**Non-Goals:**
- Converter stations, DC→AC migration of existing customers (possible follow-up change).
- A third tariff; three-phase = AC (single-phase vs. three-phase not further split — "Drehstrom" is the historical term for this era's entire AC system).
- Transmission losses / network topology.

## Decisions

**D1 — Current type on the generator, not the plant.** `buildings.json` gets `currentType: 'dc' | 'ac'` on generators; the alternator (`alternator-1892`) is the first AC generator. Steam engines stay neutral. This allows parallel plants with mixed generators and is historically correct (the prime mover does not care about DC/AC, the generator does). `plant.currentType` (display) becomes derived: a plant with ≥ 1 AC generator shows ~, otherwise ⎓.

**D2 — Availability via year gate, not research.** The alternator appears in the catalog once `state.clock.year >= 1892`. The newspaper year 1891 ("Wunder von Lauffen") is the canon anchor: the player reads about the breakthrough in 1891 and can build from 1892. No tech tree, no research points — matches the M1 event structure (newspaper history + coal-factor change 1894).

**D2a — "Available from 1892" badge in the catalog.** Before 1892 the building catalog renders the alternator grayed out with the hint "available from 1892" (not hidden), so the player knows what is coming. (Parallel to the locked region button: `aria-disabled` + guard.)

**D3 — One region-wide tariff pair, not per plant.** `economy.tariff` becomes `{ dc: number; ac: number }` (both $/kWh, same clamp bounds as today). The player sets both via one slider each. Rationale: one utility, one province, two current types — per-plant tariffs would be micromanagement without historical basis (municipal concessions set city-network tariffs, not per plant).

**D3a — Separate dispatch pools per current type.** AC and DC capacity are reported separately per plant AND dispatched as separate pools: DC demand is served from DC capacity only, AC demand from AC capacity only, with served/unserved energy and peaks recorded per pool. Rationale: the two current types are separate physical line networks in the same service area (historically plants operated both in parallel — but a DC network cannot feed AC appliances and vice versa). "One region dispatch" from `region-grid-lighting` continues to mean one dispatch *result* per region, now as the union of the two pools. (Revised 2026-08-24 after playtest: the original single-pool variant let DC capacity silently serve AC customers — violating the separation principle.)

**D4 — AC adoption: same physics, new counters.** `growth.shares` becomes `shares[settlementId][segment]` → `{ dc: number; ac: number }` with `dc + ac ≤ 1`. Rules:
- DC adoption: as today (blackout, tariff.dc ≤ wtp).
- AC adoption: as today, but capacity and tariff conditions measured against AC; starts at 0.
- Migration DC→AC: deliberately **not** in this change (no converter station) — but structurally prepared, because shares are tracked per current type.
- Tram/industry can later become AC-only segments (follow-up change).

**D5 — SAVE_VERSION 4 with migration.** v3 saves: all components → `dc`, `tariff` (number) → `{ dc: tariff, ac: tariff }` (AC tariff starts equal), shares → `{ dc: oldShare, ac: 0 }`. Deterministic migration, no data loss.

**D6 — Extended 1891 report.** The existing 1891 line in `history.json` is extended (Lauffen→Frankfurt, 176 km, ~75% efficiency, Miller/Dolivo-Dobrowolsky): the article proclaims the breakthrough; from 1892 the alternator is buildable. It remains **one** entry (no new ID), so the newspaper flow ("Year with entry") stays unchanged.

## Risks / Trade-offs

- **One dispatch, two current types** could look physically unhistorical (DC and AC in the same network?). Reality was: separate line networks of the same plants in the same area. The dispatch result per region is now the union of two separated pools (D3a revised): the "one region dispatch" abstraction from `region-grid-lighting` (region = one network) is refined, not abandoned — each current type is its own network, the region result aggregates both.
- **Two tariff sliders** + customer mix breakdown raise UI load. Mitigated by the customer mix panel (one source of truth for both current types).
- **AC starts at 0** — the first AC quarters feel "dead" (no AC customers, but maintenance costs). Historically correct and intended: the conversion pain is the point. UI hint in the customer mix panel ("Three-phase: no customers yet — lower the tariff or wait").

## Migration Plan

v3 → v4 as D5. The `SAVE_VERSION` guard (spec: persistence "Version guard") continues to apply: v3 saves are migrated at load, not rejected — the guard text remains for future versions. Implementation: `persistence.ts` `migrateSave(raw)` before validation.

## Resolved Decisions (User, 2026-08-24)

**D7 — DC acceptance toggle "no new DC contracts".** Historically DC remained purchasable in parallel (Munich DC until 1948, NYC until 2007) — in the game the phase-out is a player decision, not automatic. New state `dcAcceptingNew` (default `true`, part of save v4). Effect when `false`: (a) DC adoption stops growing (no new customers); (b) existing DC customers churn per quarter at a fixed rate (balance parameter `dcPhaseOutPerQuarter`, initially 2–3 percentage points), **but only** if AC capacity is available AND the AC tariff < DC tariff — model: when appliances wear out or are replaced, the customer moves to AC. Without the toggle: no churn (historic DC enclaves ran for decades).

**D8 — Alternator balancing: initially identical to the dynamo.** `alternator-1892` starts at 50 kW, same cost and lead time as `generator-50kw` — a technology-neutral entry; the conversion pain arises from capacity buildup and customer acquisition, not price discrimination. Larger generator classes come later as pure data extensions (`buildings.json` is data-driven; historically three-phase scaled quickly to several hundred kW by 1900) — no spec change needed.

**D9 — The tram stays a DC consumer; its supply switches (follow-up change).** Historically: trams ran 600 V DC from the start and still do; from around 1900–1910 substations with rotary converters fed them from the three-phase long-distance grid (IEEE/nycsubway sources). For the game, sketched as follow-up change `tram-supply-conversion`: at a historical cut-off year the tram company sends a request to the player (newspaper/message system) — "from year X you supply us via a converter station from your three-phase network". From X the tram load counts on the AC side (with converter efficiency loss) as long as converter station + AC capacity exist; otherwise blackout risk for the tram segment. The player is warned one year ahead (like the crisis announcement) and must build AC + converter in time. That change builds on the AC shares and the converter-less core here.

## Open Questions

- None left in this scope. (Tram conversion: follow-up change `tram-supply-conversion`, see D9; industry as an AC segment to be evaluated there.)
