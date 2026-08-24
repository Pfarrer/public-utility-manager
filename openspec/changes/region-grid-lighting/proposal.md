# Why

The city view lies. In the current sim core, electrification grows in **every** settlement of a region — `GrowthState.shares` exists per settlement, and region capacity serves the aggregated region demand. Yet the city view only shows light around the anchor of the settlement's own (hash-assigned) plant. The result: the fishing village stays visually dark even though the core long since models it as served and growing. The game communicates "I can only ever supply one city" — a rendering artifact, not a simulation result.

## Killer Argument

The player loses the game's most important realism anchor: that electrification *radiates* from the plant — across lines, into every place in the region. Today's glow code (`glowR > 0 && s.plants.length > 0` plus a circle around `s.plants[0]`) ties light to the presence of a plant inside the polygon. That contradicts the core (region dispatch) and the spec's own wording "when no plant is operational" (meaning: as long as *any* plant of the region runs, the settlement is supplied).

# What Changes

- **Region grid (display):** One region = one network. As long as one plant in the region is operational, all of its settlements are connected — servable and lit.
- **Light follows the core's truth:** The lit area fraction per settlement equals its true household-weighted electrification share (`shares`), independent of where the plant sits. No plant running → all polygons gray.
- **Distribution lines:** An animated distribution line (dash offset) runs from the plant anchor to the center of every connected settlement — the power visibly *flows* from the plant into the village. It is the visual carrier of the grid and shows you where the light comes from.
- **Plant placement unchanged:** Deterministic hash anchors, no slot system, no sim core change, SAVE_VERSION stays 3.
# Impact

- `specs/city-view/spec.md` — MODIFIED: "Illumination reflects electrification" (grid state instead of plant presence as the condition), "Flow lines from plants to settlement" (distribution lines to every connected settlement)
- Implementation: `app/src/lib/components/CityView.svelte`
- No changes to sim core, data, or save format
