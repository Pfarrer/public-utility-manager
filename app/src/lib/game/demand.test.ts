import { describe, expect, it } from 'vitest';
import profilesJson from '$lib/data/profiles.json';
import provinceM1 from '$lib/data/province-m1.json';
import {
	aggregate,
	businessGroupCurve,
	drawJitter,
	householdGroupCurve,
	loadProfiles,
	profileCurve,
	profiles,
	regionDemand
} from './demand';
import { createRng } from './rng';
import { loadScenario } from './scenario';
import type { Region } from './province';

describe('profile math', () => {
	it('is non-negative everywhere', () => {
		const curve = profileCurve(profiles.household);
		for (let h = 0; h < 24; h++) {
			expect(curve[h]).toBeGreaterThanOrEqual(0);
		}
	});

	it('household curve shows a morning and an evening peak', () => {
		const curve = profileCurve(profiles.household);
		const argmax = (from: number, to: number) => {
			let best = from;
			for (let i = from; i < to; i++) if (curve[i] > curve[best]) best = i;
			return best;
		};
		const morningPeak = argmax(5, 10);
		const eveningPeak = argmax(17, 22);
		expect(morningPeak).toBeGreaterThanOrEqual(6);
		expect(morningPeak).toBeLessThanOrEqual(8);
		expect(eveningPeak).toBeGreaterThanOrEqual(18);
		expect(eveningPeak).toBeLessThanOrEqual(20);
	});

	it('wealth scales daily energy monotonically (wealthy > average > poor)', () => {
		const energy = (cat: 'wealthy' | 'average' | 'poor') =>
			householdGroupCurve(1, cat, null).reduce((s, kw) => s + kw, 0);
		expect(energy('wealthy')).toBeGreaterThan(energy('average'));
		expect(energy('average')).toBeGreaterThan(energy('poor'));
	});

	it('business curve: work hours >= 150% of base, lunch dip below neighbours', () => {
		const curve = profileCurve(profiles.business);
		const base = profiles.business.baseKw;
		for (const h of [9, 10, 11, 14, 15, 16]) {
			expect(curve[h]).toBeGreaterThanOrEqual(base * 1.5);
		}
		expect(curve[12]).toBeLessThan(curve[11]);
		expect(curve[13]).toBeLessThan(curve[14]);
	});
});

describe('seeded jitter', () => {
	it('same seed -> identical jitter, bounds respected', () => {
		const a = drawJitter(createRng(42));
		const b = drawJitter(createRng(42));
		expect(a).toEqual(b);
		const rng = createRng(1);
		for (let i = 0; i < 500; i++) {
			const j = drawJitter(rng);
			expect(Math.abs(j.amplitudeScale - 1)).toBeLessThanOrEqual(0.1 + 1e-9);
			expect(Math.abs(j.phaseShiftHours)).toBeLessThanOrEqual(1.0 + 1e-9);
		}
	});

	it('different groups drawn in order differ but replay identically', () => {
		const rng = createRng(7);
		const first = drawJitter(rng);
		const second = drawJitter(rng);
		expect(first).not.toEqual(second);
		const rng2 = createRng(7);
		expect(drawJitter(rng2)).toEqual(first);
		expect(drawJitter(rng2)).toEqual(second);
	});
});

describe('region aggregation', () => {
	const province = loadScenario(provinceM1);
	const coast = province.regions[0] as Region;

	it('aggregate = element-wise sum; peak/energy derived', () => {
		const rng = createRng(99);
		const curves = [
			householdGroupCurve(400, 'wealthy', drawJitter(rng)),
			householdGroupCurve(2300, 'average', drawJitter(rng)),
			householdGroupCurve(3700, 'poor', drawJitter(rng))
		];
		const demand = aggregate(curves);
		for (let h = 0; h < 24; h++) {
			expect(demand.curve[h]).toBeCloseTo(curves[0][h] + curves[1][h] + curves[2][h], 6);
		}
		expect(demand.peakKw).toBe(Math.max(...demand.curve));
		expect(demand.energyKwh).toBeCloseTo(demand.curve.reduce((s, kw) => s + kw, 0), 6);
	});

	it('regionDemand draws groups in deterministic order and replays', () => {
		const run = () => regionDemand(coast, createRng(1234));
		expect(run()).toEqual(run());
		expect(run().curve.every((kw) => kw >= 0)).toBe(true);
	});

	it('coast region peak is plausible for its household numbers', () => {
		const demand = regionDemand(coast, createRng(5));
		expect(demand.peakKw).toBeGreaterThan(100);
		expect(demand.peakKw).toBeLessThan(1000);
	});

	it('business curve with businesses is non-negative and sizable', () => {
		const curve = businessGroupCurve(10, null);
		expect(curve.every((kw) => kw >= 0)).toBe(true);
		expect(Math.max(...curve)).toBeGreaterThan(10 * profiles.business.baseKw);
	});
});

describe('profiles data validation', () => {
	it('rejects bad data naming the field', () => {
		const broken = structuredClone(profilesJson);
		broken.household.baseKw = -1;
		expect(() => loadProfiles(broken)).toThrow(/baseKw/);
	});
});
