import { describe, expect, it } from 'vitest';
import {
	SATISFACTION_TUNING,
	dispatchQuarter,
	updateSatisfaction
} from './dispatch';

describe('dispatchQuarter', () => {
	it('deficit hour: served = min(demand, capacity), rest unserved (spec scenario)', () => {
		const curve = new Array<number>(24).fill(0);
		curve[19] = 120;
		const r = dispatchQuarter(curve, 100);
		const hour19 = r.servedKwh; // only hour 19 has demand
		expect(hour19).toBe(100);
		expect(r.unservedKwh).toBe(20);
		expect(r.outageHours).toBe(1);
		expect(r.peakKw).toBe(120);
		expect(r.blackout).toBe(true);
	});

	it('blackout flag with totals (spec scenario: 150 kWh unserved)', () => {
		const curve = new Array<number>(24).fill(0);
		curve[18] = 100;
		curve[19] = 150; // 100 over capacity
		curve[20] = 60;
		const r = dispatchQuarter(curve, 50);
		expect(r.unservedKwh).toBe(50 + 100 + 10);
		expect(r.blackout).toBe(true);
	});

	it('zero-deficit quarter: no blackout, everything served', () => {
		const curve = Array.from({ length: 24 }, (_, h) => 10 + h);
		const r = dispatchQuarter(curve, 100);
		expect(r.servedKwh).toBe(curve.reduce((s, kw) => s + kw, 0));
		expect(r.unservedKwh).toBe(0);
		expect(r.outageHours).toBe(0);
		expect(r.blackout).toBe(false);
		expect(r.peakKw).toBe(33);
	});
});

describe('updateSatisfaction', () => {
	it('early-era outage: small non-zero drop derived from era factor (spec scenario)', () => {
		const drop = 3 * SATISFACTION_TUNING.dropPerOutageHour * SATISFACTION_TUNING.eraFactor;
		expect(drop).toBeGreaterThan(0);
		expect(drop).toBeLessThan(3);
		expect(updateSatisfaction(50, { outageHours: 3, blackout: true })).toBeCloseTo(50 - drop, 6);
	});

	it('recovery over quarters, capped at 100 (spec scenario)', () => {
		let sat = 70;
		for (let q = 0; q < 4; q++) sat = updateSatisfaction(sat, { outageHours: 0, blackout: false });
		expect(sat).toBeCloseTo(70 + 4 * SATISFACTION_TUNING.recoveryPerQuarter, 6);
		// saturation: from 99, many quarters never exceed 100
		let high = 99;
		for (let q = 0; q < 10; q++) high = updateSatisfaction(high, { outageHours: 0, blackout: false });
		expect(high).toBe(100);
	});

	it('never drops below 0', () => {
		expect(updateSatisfaction(1, { outageHours: 24, blackout: true })).toBe(0);
	});
});

describe('tick integration (demand → dispatch)', () => {
	it('runs per unlocked region, records history and satisfaction', async () => {
		const { createInitialState, tick } = await import('./sim');
		const state = tick(createInitialState());
		const dispatch = state.systems.dispatch;
		expect(Object.keys(dispatch.current)).toEqual(['region-coast']);
		const coast = dispatch.current['region-coast'];
		if (!coast) throw new Error('missing coast entry');
		expect(coast.year).toBe(1890);
		expect(coast.quarter).toBe(2); // clock advanced before systems run
		expect(coast.capacityKw).toBe(0); // no plants yet
		expect(coast.blackout).toBe(true); // demand with zero capacity
		expect(coast.unservedKwh).toBeGreaterThan(0);
		expect(dispatch.history).toHaveLength(1);
		// early era, heavy outage: satisfaction fell from initial 50
		const initialDrop = coast.outageHours * 4 * 0.2;
		expect(dispatch.satisfaction['region-coast']).toBeCloseTo(50 - initialDrop, 6);
		// replay determinism: same seed → same curves → same result
		expect(tick(createInitialState())).toEqual(state);
	});

	it('capacity from an operational plant serves the curve', async () => {
		const { createInitialState, tick } = await import('./sim');
		const { createPlant } = await import('./plant');
		const state = createInitialState();
		const plant = createPlant(state, 'region-coast', 'Hafenkraftwerk');
		// 2 engines × 3 slots, 6 dynamos à 50 kW = 300 kW installed
		for (let i = 0; i < 2; i++) {
			state.systems.construction.plants
				.find((p) => p.id === plant.id)
				?.components.push(
					{ id: 100 + i * 10, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
					{ id: 101 + i * 10, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 },
					{ id: 102 + i * 10, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 },
					{ id: 103 + i * 10, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
				);
		}
		const next = tick(state);
		const coast = next.systems.dispatch.current['region-coast'];
		if (!coast) throw new Error('missing coast entry');
		// 2 engines → 6 slots → 6 dynamos operational = 300 kW (full staffing implied)
		expect(coast.capacityKw).toBe(300);
		expect(coast.peakKw).toBeGreaterThan(0);
	});
});
