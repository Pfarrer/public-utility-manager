# Why

Since the regional grid (change `region-grid-lighting`), the player sees *that* every settlement of a region is supplied — but not **where** the power actually comes from, nor **which current type** their plants generate. During the historic transition from DC to (three-phase) AC — the core of the game — the player must be able to tell at any moment: which plant feeds which settlement? Does this plant generate DC or AC? And which customer groups currently draw how much power, in percent?

Without that transparency, the planned current-type migration (change `add-three-phase-power`) stays a black box: the player would have to build AC capacity blind, without seeing what their customers actually adopt.

# What Changes

- **Power origin at every settlement:** The city view shows a compact origin line per settlement (e.g. "Strom aus: Hafenstadt-Werk") when the settlement is fed from the regional grid; settlements with their own plant show "Eigenversorgung". The city view's distribution lines remain the spatial evidence.
- **Current-type badge on plants:** The plant icon in the city view and the entry in the plant panel carry a current-type marker (⎓ for DC, ~ for AC). Until change `add-three-phase-power` is implemented, all plants show ⎓ DC.
- **Customer mix per settlement:** A new customer panel shows the electrification share in percent per settlement and wealth segment ("Ø 42 % — wealthy 71 % / average 40 % / poor 11 %"), derived from the existing `GrowthState.shares`. After change `add-three-phase-power`, this panel additionally breaks down by current type.
- **No sim core change:** Everything is a pure render-time derivation from the `GameState` (plants, shares, households, dispatch). No new mechanics, no save format bump (SAVE_VERSION stays 3).

# Impact

- `specs/city-view/spec.md` — ADDED requirement "Power origin is visible per settlement" + MODIFIED "Plants render as animated icons" (current-type badge)
- `specs/game-ui/spec.md` — ADDED requirement "Customer mix panel" (percent per segment per settlement)
- Implementation: `app/src/lib/components/CityView.svelte`, new component `CustomerMixPanel.svelte`, `PlantPanel.svelte` (badge)
- No changes to sim core, data, or save format
