/**
 * Separated DC/AC dispatch pools (change: add-three-phase-power).
 * Regression tests for the "silent cross-supply" bug: AC customers must not
 * be served from DC capacity, and migration must respect AC headroom.
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { createInitialState, tick } from '$lib/game/sim';
import { createPlant, orderComponent } from '$lib/game/plant';
import { setTariffCurrent } from '$lib/game/economy';
import type { GameState } from '$lib/game/types';

function advance(state: GameState, quarters: number): GameState {
	let s = state;
	for (let i = 0; i < quarters; i++) s = tick(s);
	return s;
}

function dcOnlyState(): GameState {
	let s = createInitialState();
	const plant = createPlant(s, 'region-coast', 'Werk 1');
	orderComponent(s, plant.id, 'steam-engine-1890');
	orderComponent(s, plant.id, 'generator-50kw');
	orderComponent(s, plant.id, 'generator-50kw');
	s = advance(s, 3);
	return s;
}

describe('separated DC/AC dispatch pools', () => {
	it('DC-only generation: no AC adoption, no cross-supply', () => {
		let s = dcOnlyState();
		setTariffCurrent(s, 'ac', 0.2);
		s.systems.economy.dcAcceptingNew = false;
		s = advance(s, 40);
		const shares = s.systems.growth.shares['city-hafenstadt'];
		const d = s.systems.dispatch.current['region-coast'];
		// AC share stays 0 without AC capacity; demand is served from the DC pool only
		expect(shares.wealthy.ac).toBe(0);
		expect(d.acCapacityKw).toBe(0);
		expect(d.acServedKwh).toBe(0);
		expect(d.blackout).toBe(false);
	});

	it('one alternator does not migrate the whole region (headroom gate)', () => {
		let s = dcOnlyState();
		const plant = s.systems.construction.plants[0];
		orderComponent(s, plant.id, 'alternator-1892');
		setTariffCurrent(s, 'ac', 0.2);
		s.systems.economy.dcAcceptingNew = false;
		s = advance(s, 20);
		const shares = s.systems.growth.shares['city-hafenstadt'];
		const d = s.systems.dispatch.current['region-coast'];
		// Drift is bounded by AC headroom: migration stops once AC demand
		// fills the 50 kW pool — the DC share never drains to zero and AC
		// never serves more than its pool could deliver.
		expect(shares.wealthy.dc).toBeGreaterThan(0);
		expect(d.acServedKwh).toBeLessThanOrEqual(d.acCapacityKw * 24 * 91);
		expect(d.acUnservedKwh).toBeGreaterThan(0); // AC pool saturated: bound holds
	});

	it('AC demand above AC capacity is unserved, not served from DC', () => {
		let s = dcOnlyState();
		const plant = s.systems.construction.plants[0];
		orderComponent(s, plant.id, 'alternator-1892');
		s = advance(s, 8);
		// sabotage: alternator offline again
		const p = s.systems.construction.plants[0];
		for (const c of p.components) {
			if (c.componentId === 'alternator-1892') {
				c.status = 'under_construction';
				c.remaining = 99; // keep it from completing this tick
			}
		}
		s = advance(s, 1);
		const d = s.systems.dispatch.current['region-coast'];
		// AC customers exist but AC capacity is gone: their demand counts as
		// unserved (blackout), never silently served from the DC pool.
		expect(d.acCapacityKw).toBe(0);
		expect(d.acUnservedKwh).toBeGreaterThan(0);
		expect(d.blackout).toBe(true);
	});
});
