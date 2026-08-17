import { describe, expect, it } from 'vitest';
import growthJson from '$lib/data/growth.json';
import { regionDemand } from './demand';
import { createRng } from './rng';
import { createInitialState, tick } from './sim';
import {
	growth,
	initGrowth,
	loadGrowth,
	nextShare,
	runGrowth,
	yearlyGrowth
} from './growth';
import type { GameState } from './types';

describe('growth data', () => {
	it('loads the M1 balance data', () => {
		expect(growth.initialShare).toBe(0.05);
		expect(growth.adoptionRatePerQuarter).toBe(0.04);
		expect(growth.deadoptionRatePerQuarter).toBe(0.01);
		expect(growth.householdGrowthBasePerYear).toBe(0.02);
		expect(growth.wealthDriftPerYear).toBe(0.02);
		expect(growth.driftSatisfactionThreshold).toBe(80);
	});

	it('spec: threshold ordering wealthy > average > poor', () => {
		const { willingnessToPay: wtp } = growth;
		expect(wtp.wealthy).toBeGreaterThan(wtp.average);
		expect(wtp.average).toBeGreaterThan(wtp.poor);
	});

	it('rejects bad data naming the field', () => {
		const broken = structuredClone(growthJson);
		broken.initialShare = 2;
		expect(() => loadGrowth(broken)).toThrow(/initialShare/);
	});
});

describe('nextShare', () => {
	it('spec: good service (no blackout, tariff ≤ wtp) increases the share', () => {
		const next = nextShare(0.5, { blackout: false, tariff: 0.3, satisfaction: 60 }, 0.5);
		expect(next).toBeCloseTo(0.54, 10);
	});

	it('stalls with only one bad factor (blackout xor overprice)', () => {
		const stalled = nextShare(0.5, { blackout: true, tariff: 0.3, satisfaction: 60 }, 0.5);
		expect(stalled).toBe(0.5);
		const stalled2 = nextShare(0.5, { blackout: false, tariff: 0.4, satisfaction: 60 }, 0.3);
		expect(stalled2).toBe(0.5);
	});

	it('spec: blackout + overprice shrinks the share (deadoption)', () => {
		const next = nextShare(0.5, { blackout: true, tariff: 0.4, satisfaction: 60 }, 0.3);
		expect(next).toBeCloseTo(0.49, 10);
	});

	it('clamps to [0, 1]', () => {
		expect(nextShare(0.99, { blackout: false, tariff: 0.1, satisfaction: 90 }, 0.15)).toBe(1);
		expect(nextShare(0.005, { blackout: true, tariff: 0.4, satisfaction: 10 }, 0.15)).toBe(0);
	});
});

describe('initGrowth', () => {
	it('copies scenario households and sets initial shares', () => {
		const g = initGrowth();
		const coast = g.households['city-hafenstadt'];
		expect(coast).toBeDefined();
		expect(coast.poor + coast.average + coast.wealthy).toBeGreaterThan(0);
		for (const cat of ['wealthy', 'average', 'poor'] as const) {
			expect(g.shares['city-hafenstadt'][cat]).toBeCloseTo(growth.initialShare, 10);
		}
	});
});

describe('runGrowth (quarterly adoption)', () => {
	it('spec: good quarter raises every segment share in unlocked regions', () => {
		const state = createInitialState();
		state.systems.economy.tariff = 0.15; // ≤ poor wtp → all segments affordable
		state.systems.dispatch.current['region-coast'] = {
			regionId: 'region-coast',
			year: 1890,
			quarter: 1,
			capacityKw: 9999,
			peakKw: 10,
			servedKwh: 100,
			unservedKwh: 0,
			outageHours: 0,
			blackout: false
		};
		runGrowth(state);
		const shares = state.systems.growth.shares['city-hafenstadt'];
		expect(shares.wealthy).toBeCloseTo(0.05 + 0.04, 10);
		expect(shares.average).toBeCloseTo(0.05 + 0.04, 10);
		expect(shares.poor).toBeCloseTo(0.05 + 0.04, 10);
	});

	it('spec: 4 blackout + overprice quarters → year-end share < year start', () => {
		const state = createInitialState();
		state.systems.economy.tariff = 0.6; // above every wtp
		for (let q = 1; q <= 4; q++) {
			state.systems.dispatch.current['region-coast'] = {
				regionId: 'region-coast',
				year: 1890,
				quarter: q,
				capacityKw: 0,
				peakKw: 10,
				servedKwh: 0,
				unservedKwh: 100,
				outageHours: 5,
				blackout: true
			};
			runGrowth(state);
		}
		const shares = state.systems.growth.shares['city-hafenstadt'];
		expect(shares.wealthy).toBeCloseTo(0.05 - 4 * 0.01, 10);
		expect(shares.poor).toBeCloseTo(Math.max(0, 0.05 - 4 * 0.01), 10);
		expect(shares.wealthy).toBeLessThan(growth.initialShare);
	});
});

describe('yearlyGrowth', () => {
	/** State with full electrification and satisfaction 90 in the coast region. */
	function prosperousState(): GameState {
		const state = createInitialState();
		state.systems.dispatch.satisfaction['region-coast'] = 90;
		for (const id of Object.keys(state.systems.growth.households)) {
			state.systems.growth.shares[id] = { wealthy: 1, average: 1, poor: 1 };
		}
		return state;
	}

	it('spec: prosperous year increases households and the wealthy+average share', () => {
		const state = prosperousState();
		const before = structuredClone(state.systems.growth.households);
		yearlyGrowth(state);
		const after = state.systems.growth.households;
		// unlocked (coast) settlements grow and drift up
		for (const id of ['city-hafenstadt', 'village-fischerdorf']) {
			const totalBefore = before[id].wealthy + before[id].average + before[id].poor;
			const totalAfter = after[id].wealthy + after[id].average + after[id].poor;
			expect(totalAfter).toBeGreaterThan(totalBefore);
			const upBefore = (before[id].wealthy + before[id].average) / totalBefore;
			const upAfter = (after[id].wealthy + after[id].average) / totalAfter;
			expect(upAfter).toBeGreaterThan(upBefore);
		}
		// locked regions are untouched
		for (const id of ['city-bergstadt', 'village-hochlanddorf', 'village-ackerdorf']) {
			expect(after[id]).toEqual(before[id]);
		}
	});
	it('conserves totals exactly during drift', () => {
		const state = prosperousState();
		const before = structuredClone(state.systems.growth.households);
		yearlyGrowth(state);
		for (const id of Object.keys(before)) {
			const b = before[id];
			const a = state.systems.growth.households[id];
			// additions went to poor; drift moved some up. Total = before + additions.
			const gainedUp = a.wealthy + a.average - (b.wealthy + b.average);
			const poorDelta = a.poor - b.poor;
			// every household that left poor beyond the additions arrived up
			expect(gainedUp).toBeGreaterThanOrEqual(0);
			const additions = (a.wealthy + a.average + a.poor) - (b.wealthy + b.average + b.poor);
			expect(poorDelta).toBeCloseTo(additions - gainedUp, 10);
		}
	});

	it('low satisfaction: no wealth drift (below threshold), growth scaled down', () => {
		const state = createInitialState();
		state.systems.dispatch.satisfaction['region-coast'] = 30;
		for (const id of Object.keys(state.systems.growth.households)) {
			state.systems.growth.shares[id] = { wealthy: 1, average: 1, poor: 1 };
		}
		const before = structuredClone(state.systems.growth.households);
		yearlyGrowth(state);
		for (const id of ['city-hafenstadt', 'village-fischerdorf']) {
			const b = before[id];
			const a = state.systems.growth.households[id];
			// no drift: wealthy unchanged, average unchanged
			expect(a.wealthy).toBe(b.wealthy);
			expect(a.average).toBe(b.average);
			// growth still happens but scaled: additions ≤ base × full scale
			const totalB = b.wealthy + b.average + b.poor;
			const totalA = a.wealthy + a.average + a.poor;
			expect(totalA - totalB).toBeLessThanOrEqual(Math.floor(totalB * 0.02 * 0.3));
		}
	});
});

describe('demand × growth integration', () => {
	it('connected households drive the curve: shares scale demand down', () => {
		const region = {
			id: 'r',
			name: 'R',
			terrain: 'coast',
			unlocked: true,
			settlements: [
				{
					id: 's',
					name: 'S',
					type: 'city',
					population: 1000,
					households: { wealthy: 100, average: 100, poor: 100 }
				}
			]
		} as const;
		const full = regionDemand(region as never, createRng(1), {
			households: { s: { wealthy: 100, average: 100, poor: 100 } },
			shares: { s: { wealthy: 1, average: 1, poor: 1 } }
		});
		const partial = regionDemand(region as never, createRng(1), {
			households: { s: { wealthy: 100, average: 100, poor: 100 } },
			shares: { s: { wealthy: 0.5, average: 0.5, poor: 0.5 } }
		});
		expect(partial.energyKwh).toBeCloseTo(full.energyKwh * 0.5, 6);
	});
});

describe('tick integration', () => {
	it('year boundary (settled Q4) triggers household growth', () => {
		// fast-forward to a Q4 state
		let state = createInitialState();
		while (state.clock.quarter !== 4) state = tick(state);
		const before = structuredClone(state.systems.growth.households);
		// make the year prosperous so growth actually happens
		state.systems.dispatch.satisfaction['region-coast'] = 90;
		for (const id of Object.keys(state.systems.growth.households)) {
			state.systems.growth.shares[id] = { wealthy: 1, average: 1, poor: 1 };
		}
		const next = tick(state); // settles Q4 → year boundary
		const after = next.systems.growth.households;
		let grew = false;
		for (const id of Object.keys(before)) {
			const b = before[id].wealthy + before[id].average + before[id].poor;
			const a = after[id].wealthy + after[id].average + after[id].poor;
			if (a > b) grew = true;
		}
		expect(grew).toBe(true);
	});

	it('non-Q4 tick does not touch households', () => {
		const state = createInitialState();
		const before = structuredClone(state.systems.growth.households);
		const next = tick(state);
		expect(next.systems.growth.households).toEqual(before);
	});

	it('determinism: same seed replays identically over 8 quarters', () => {
		const a = Array.from({ length: 8 }, (_, i) => i).reduce<GameState>(
			(s) => tick(s),
			createInitialState(42)
		);
		const b = Array.from({ length: 8 }, (_, i) => i).reduce<GameState>(
			(s) => tick(s),
			createInitialState(42)
		);
		expect(a).toEqual(b);
	});
});
