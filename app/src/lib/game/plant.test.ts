import { describe, expect, it } from 'vitest';
import buildingsJson from '$lib/data/buildings.json';
import { createInitialState, tick } from './sim';
import {
	advanceConstruction,
	buildings,
	createPlant,
	loadBuildings,
	orderComponent,
	plantAvailableCapacity,
	plantInstalledCapacity,
	plantRequiredCrew
} from './plant';
import type { GameState } from './types';

const ENGINE = 'steam-engine-1890';
const GENERATOR = 'generator-50kw';

/** Fresh state with one plant; pre-place operational components (as if delivered). */
function stateWithPlant(): { state: GameState; plantId: number } {
	const state = createInitialState();
	const plant = createPlant(state, 'region-coast', 'Kraftwerk Hafenstadt');
	return { state, plantId: plant.id };
}

function giveOperational(state: GameState, plantId: number, componentId: string, n: number): void {
	const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
	for (let i = 0; i < n; i++) {
		const spec = buildingsJson.components.find((c) => c.id === componentId)!;
		plant.components.push({
			id: 1000 + plant.components.length,
			componentId,
			status: 'operational',
			remaining: 0,
			cost: spec.cost
		});
	}
}

function giveUnderConstruction(state: GameState, plantId: number, componentId: string, n: number): void {
	const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
	for (let i = 0; i < n; i++) {
		const spec = buildingsJson.components.find((c) => c.id === componentId)!;
		plant.components.push({
			id: 1000 + plant.components.length,
			componentId,
			status: 'under_construction',
			remaining: 1,
			cost: spec.cost
		});
	}
}

describe('catalog', () => {
	it('loads with one engine and two generator types (dc dynamo + ac alternator)', () => {
		expect(buildings.engines.size).toBe(1);
		expect(buildings.generators.size).toBe(2);
		expect(buildings.engines.get(ENGINE)!.generatorsDriven).toBe(3);
		expect(buildings.generators.get('alternator-1892')!.currentType).toBe('ac');
		expect(buildings.generators.get(GENERATOR)!.currentType).toBe('dc');
	});

	it('rejects a catalog with a negative cost naming the field', () => {
		const broken = structuredClone(buildingsJson);
		broken.components[0].cost = -1;
		expect(() => loadBuildings(broken)).toThrow(/cost/);
	});
});

describe('capacity from components', () => {
	it('2 engines × 3 generators of 50 kW = 300 kW (spec scenario)', () => {
		const { state, plantId } = stateWithPlant();
		giveOperational(state, plantId, ENGINE, 2);
		giveOperational(state, plantId, GENERATOR, 6);
		const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
		expect(plantInstalledCapacity(plant)).toBe(300);
	});

	it('generators beyond engine slots are not backed', () => {
		const { state, plantId } = stateWithPlant();
		giveOperational(state, plantId, ENGINE, 1); // 3 slots
		giveOperational(state, plantId, GENERATOR, 5); // only 3 backed
		const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
		expect(plantInstalledCapacity(plant)).toBe(150);
	});

	it('under-construction components contribute nothing', () => {
		const { state, plantId } = stateWithPlant();
		giveOperational(state, plantId, ENGINE, 1);
		const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
		plant.components.push({
			id: 999,
			componentId: GENERATOR,
			status: 'under_construction',
			remaining: 1,
			cost: 5000
		});
		expect(plantInstalledCapacity(plant)).toBe(0);
	});
});

describe('construction queue', () => {
	it('generator (build time 1) ordered in Q1 delivers at Q2 with debit', () => {
		const { state, plantId } = stateWithPlant();
		state.cash = 100_000;
		expect(orderComponent(state, plantId, GENERATOR)).toMatchObject({ ok: true });
		const afterOrder = tick(state); // Q1 → Q2
		const comp = afterOrder.systems.construction.plants[0]!.components[0]!;
		expect(comp.status).toBe('operational');
		// 5000 construction (memo) + wages for 2 crew from delivery quarter (implicit staffing)
		expect(afterOrder.cash).toBe(100_000 - 5000 - 500);
		expect(afterOrder.systems.construction.completed[0]).toMatchObject({
			componentId: GENERATOR,
			cost: 5000
		});
	});

	it('engine (build time 2) ordered in Q1 delivers at Q3 (spec scenario)', () => {
		const { state, plantId } = stateWithPlant();
		state.cash = 100_000;
		orderComponent(state, plantId, ENGINE);
		const q2 = tick(state);
		expect(q2.systems.construction.plants[0]!.components[0]!.status).toBe('under_construction');
		const q3 = tick(q2);
		expect(q3.systems.construction.plants[0]!.components[0]!.status).toBe('operational');
		// 8000 construction + wages for 8 crew once the engine is operational (delivery quarter)
		expect(q3.cash).toBe(100_000 - 8000 - 2000);
	});

	it('rejects orders whose outstanding costs exceed cash', () => {
		const { state, plantId } = stateWithPlant();
		state.cash = 10_000;
		expect(orderComponent(state, plantId, ENGINE)).toMatchObject({ ok: true }); // 8,000 outstanding
		const second = orderComponent(state, plantId, GENERATOR); // 5,000 more > 10,000
		expect(second).toMatchObject({ ok: false });
		if (!second.ok) expect(second.reason).toMatch(/cash/i);
	});

	it('unknown component/plant ids are rejected', () => {
		const { state, plantId } = stateWithPlant();
		expect(orderComponent(state, plantId, 'nope')).toMatchObject({ ok: false });
		expect(orderComponent(state, 4242, ENGINE)).toMatchObject({ ok: false });
	});
});

describe('derived staffing (spec: remove-employee-management)', () => {
	it('required crew sums staffing of operational components only', () => {
		const { state, plantId } = stateWithPlant();
		giveOperational(state, plantId, ENGINE, 2);
		giveOperational(state, plantId, GENERATOR, 6);
		const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
		expect(plantRequiredCrew(plant)).toBe(2 * 8 + 6 * 2);
	});

	it('components under construction hire nobody', () => {
		const { state, plantId } = stateWithPlant();
		giveOperational(state, plantId, ENGINE, 1);
		giveUnderConstruction(state, plantId, GENERATOR, 2);
		const plant = state.systems.construction.plants.find((p) => p.id === plantId)!;
		expect(plantRequiredCrew(plant)).toBe(8);
	});

	it('advanceConstruction is wired into the tick (deterministic replay)', () => {
		const run = () => {
			let s = createInitialState();
			s.cash = 50_000;
			const plant = createPlant(s, 'region-coast', 'KWK');
			orderComponent(s, plant.id, ENGINE);
			orderComponent(s, plant.id, GENERATOR);
			s = tick(s);
			return s;
		};
		expect(run()).toEqual(run());
	});
});
