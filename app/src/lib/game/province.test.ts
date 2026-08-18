import { describe, expect, it } from 'vitest';
import provinceM1 from '$lib/data/province-m1.json';
import {
	regionHouseholds,
	regionPopulation,
	settlementHouseholds,
	WEALTH_CATEGORIES
} from './province';
import { loadScenario } from './scenario';

const province = loadScenario(provinceM1);

describe('province model — scenario validation', () => {
	it('M1 scenario loads with 4 regions and exactly 1 unlocked', () => {
		expect(province.regions).toHaveLength(4);
		expect(province.regions.filter((r) => r.unlocked)).toHaveLength(1);
	});

	it('playable region contains 1 city + 1 village', () => {
		const playable = province.regions.find((r) => r.unlocked)!;
		expect(playable.settlements.filter((s) => s.type === 'city')).toHaveLength(1);
		expect(playable.settlements.filter((s) => s.type === 'village')).toHaveLength(1);
	});

	it('rejection names the offending field (negative population)', () => {
		const broken = structuredClone(provinceM1);
		broken.regions[0].settlements[0].population = -5;
		expect(() => loadScenario(broken)).toThrow(/population/);
	});

	it('rejection names the offending field (bad terrain)', () => {
		const broken = structuredClone(provinceM1);
		broken.regions[0].terrain = 'swamp' as never;
		expect(() => loadScenario(broken)).toThrow(/terrain/);
	});
});

describe('province model — selectors', () => {
	it('region population sums settlements', () => {
		const coast = province.regions[0];
		expect(regionPopulation(coast)).toBe(12000 + 2500);
	});

	it('region households aggregate per segment (spec numbers)', () => {
		const coast = province.regions[0];
		expect(regionHouseholds(coast)).toEqual({ wealthy: 400, average: 2300, poor: 3700 });
	});

	it('settlement households total > 0 for every settlement', () => {
		for (const region of province.regions) {
			for (const s of region.settlements) {
				expect(settlementHouseholds(s)).toBeGreaterThan(0);
				for (const cat of WEALTH_CATEGORIES) {
					expect(s.households[cat]).toBeGreaterThanOrEqual(0);
				}
			}
		}
	});
});
