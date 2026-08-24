/** Component-based power plants — catalog, entities, construction queue (change: remove-employee-management). */

import * as v from 'valibot';
import buildingsJson from '$lib/data/buildings.json';
import { nextId, type CurrentType, type GameState, type Plant, type PlantComponent } from './types';

// ---------------------------------------------------------------------------
// Catalog (JSON + valibot, fail-fast)
// ---------------------------------------------------------------------------

const EngineSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1)),
	kind: v.literal('engine'),
	name: v.pipe(v.string(), v.minLength(1)),
	cost: v.pipe(v.number(), v.minValue(0)),
	buildTime: v.pipe(v.number(), v.integer(), v.minValue(1)),
	/** Crew demand of one engine — staffing is derived, not player-set. */
	staffing: v.pipe(v.number(), v.integer(), v.minValue(0)),
	/** How many generators one engine of this type can drive. */
	generatorsDriven: v.pipe(v.number(), v.integer(), v.minValue(1))
});

const CurrentTypeSchema = v.picklist(['dc', 'ac']);

const GeneratorSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1)),
	kind: v.literal('generator'),
	name: v.pipe(v.string(), v.minLength(1)),
	cost: v.pipe(v.number(), v.minValue(0)),
	buildTime: v.pipe(v.number(), v.integer(), v.minValue(1)),
	/** Crew demand of one generator — staffing is derived, not player-set. */
	staffing: v.pipe(v.number(), v.integer(), v.minValue(0)),
	capacityKw: v.pipe(v.number(), v.minValue(0.01)),
	/**
	 * Generated current type — DC for every catalog generator until
	 * add-three-phase-power adds the alternator (default 'dc', so the
	 * existing data needs no change).
	 */
	currentType: v.optional(CurrentTypeSchema, 'dc')
});

const CatalogSchema = v.object({
	components: v.pipe(v.array(v.variant('kind', [EngineSchema, GeneratorSchema])), v.minLength(1))
});

export type EngineSpec = v.InferOutput<typeof EngineSchema>;
export type GeneratorSpec = v.InferOutput<typeof GeneratorSchema>;

export interface BuildingCatalog {
	engines: Map<string, EngineSpec>;
	generators: Map<string, GeneratorSpec>;
}

/** Validate and index a building catalog. Throws naming the offending field. */
export function loadBuildings(data: unknown): BuildingCatalog {
	const result = v.safeParse(CatalogSchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid building catalog at '${path}': ${issue.message}`);
	}
	const catalog: BuildingCatalog = { engines: new Map(), generators: new Map() };
	for (const c of result.output.components) {
		if (c.kind === 'engine') catalog.engines.set(c.id, c);
		else catalog.generators.set(c.id, c);
	}
	return catalog;
}

/** The M1 catalog (loaded once at module init, fail-fast). */
export const buildings: BuildingCatalog = loadBuildings(buildingsJson);

// ---------------------------------------------------------------------------
// Plant entities & derived values
// ---------------------------------------------------------------------------

/** Create a plant (empty, no components) inside the state; returns the entity. */
export function createPlant(state: GameState, regionId: string, name: string): Plant {
	const plant: Plant = { id: nextId(state), name, regionId, components: [] };
	state.systems.construction.plants.push(plant);
	return plant;
}

/**
 * Installed capacity: sum of capacities of operational generators that are
 * backed by an operational engine (each engine drives `generatorsDriven` slots).
 */
export function plantInstalledCapacity(plant: Plant, catalog: BuildingCatalog = buildings): number {
	let slots = 0;
	for (const c of plant.components) {
		if (c.status !== 'operational') continue;
		const spec = catalog.engines.get(c.componentId);
		if (spec) slots += spec.generatorsDriven;
	}
	let capacity = 0;
	for (const c of plant.components) {
		if (slots <= 0) break;
		if (c.status !== 'operational') continue;
		const spec = catalog.generators.get(c.componentId);
		if (spec) {
			capacity += spec.capacityKw;
			slots -= 1;
		}
	}
	return capacity;
}

/**
 * Available capacity: the installed capacity of operational components —
 * full staffing implied (change: remove-employee-management).
 */
export function plantAvailableCapacity(plant: Plant, catalog: BuildingCatalog = buildings): number {
	return plantInstalledCapacity(plant, catalog);
}

/**
 * Derived staff: Σ staffing of operational components (engines and
 * generators). Components under construction hire nobody — the crew grows
 * when a component completes and shrinks when one is removed
 * (change: remove-employee-management).
 */
export function plantRequiredCrew(plant: Plant, catalog: BuildingCatalog = buildings): number {
	let crew = 0;
	for (const c of plant.components) {
		if (c.status !== 'operational') continue;
		const spec = catalog.engines.get(c.componentId) ?? catalog.generators.get(c.componentId);
		if (spec) crew += spec.staffing;
	}
	return crew;
}

/**
 * The plant's generation current type: alternating current as soon as one
 * operational generator generates AC (⎓ otherwise). Pure display derivation
 * (change: add-power-origin-transparency) — the catalog is DC-only until
 * add-three-phase-power adds the alternator, so this yields 'dc' for every
 * existing plant and save.
 */
export function plantCurrentType(plant: Plant, catalog: BuildingCatalog = buildings): CurrentType {
	for (const c of plant.components) {
		if (c.status !== 'operational') continue;
		if (catalog.generators.get(c.componentId)?.currentType === 'ac') return 'ac';
	}
	return 'dc';
}

// ---------------------------------------------------------------------------
// Player actions
// ---------------------------------------------------------------------------

export type OrderResult = { ok: true; orderId: number } | { ok: false; reason: string };

/**
 * Order a component for an existing plant.
 * Costs are booked on completion; the order is rejected when current cash
 * cannot cover all outstanding order costs plus the new one.
 */
export function orderComponent(
	state: GameState,
	plantId: number,
	componentId: string,
	catalog: BuildingCatalog = buildings
): OrderResult {
	const spec = catalog.engines.get(componentId) ?? catalog.generators.get(componentId);
	if (!spec) return { ok: false, reason: `Unknown component '${componentId}'` };
	const plant = state.systems.construction.plants.find((p) => p.id === plantId);
	if (!plant) return { ok: false, reason: `Unknown plant ${plantId}` };

	const outstanding = state.systems.construction.plants
		.flatMap((p) => p.components)
		.filter((c) => c.status === 'under_construction')
		.reduce((sum, c) => sum + c.cost, 0);
	if (state.cash < outstanding + spec.cost) {
		return { ok: false, reason: 'Insufficient cash for outstanding orders plus this order' };
	}

	const component: PlantComponent = {
		id: nextId(state),
		componentId,
		status: 'under_construction',
		remaining: spec.buildTime,
		cost: spec.cost
	};
	plant.components.push(component);
	return { ok: true, orderId: component.id };
}

// ---------------------------------------------------------------------------
// Construction system (runs inside the sim tick)
// ---------------------------------------------------------------------------

/** Advance all construction orders by one quarter; debit cash on delivery. */
export function advanceConstruction(state: GameState): void {
	const construction = state.systems.construction;
	construction.completed = [];
	for (const plant of construction.plants) {
		for (const component of plant.components) {
			if (component.status === 'operational') continue;
			component.remaining -= 1;
			if (component.remaining <= 0) {
				component.status = 'operational';
				component.remaining = 0;
				state.cash -= component.cost;
				construction.completed.push({
					plantId: plant.id,
					componentId: component.componentId,
					cost: component.cost,
					year: state.clock.year,
					quarter: state.clock.quarter
				});
			}
		}
	}
}
