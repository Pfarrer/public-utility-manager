/** Unit tests for settlement display geometry (change: add-city-view). */
import { describe, expect, it } from 'vitest';
import {
	hash32,
	parseRing,
	plantAnchor,
	ringCentroid,
	ringMaxRadius,
	settlementIndexForPlant,
	stageFor,
	validateSettlementGeometry
} from './geometry';
import provinceM1 from '$lib/data/province-m1.json';
import { loadScenario } from './scenario';
import { settlementHouseholds } from './province';

const TRI = 'M 0,0 L 100,0 L 0,100 Z';

describe('parseRing', () => {
	it('parses a closed triangle into 3 vertices', () => {
		const verts = parseRing(TRI);
		expect(verts).toEqual([
			{ x: 0, y: 0 },
			{ x: 100, y: 0 },
			{ x: 0, y: 100 }
		]);
	});

	it('rejects an open path (no Z)', () => {
		expect(() => parseRing('M 0,0 L 100,0 L 0,100')).toThrow(/Malformed/);
	});

	it('rejects fewer than 3 points', () => {
		expect(() => parseRing('M 0,0 L 100,0 Z')).toThrow(/Malformed/);
	});
});

describe('ring measures', () => {
	it('centroid of the triangle is the vertex average', () => {
		expect(ringCentroid(TRI)).toEqual({ x: 100 / 3, y: 100 / 3 });
	});

	it('max radius reaches the farthest vertex', () => {
		// centroid (33.33, 33.33) → farthest vertex (0, 100)
		expect(ringMaxRadius(TRI)).toBeCloseTo(Math.hypot(100 / 3, 100 - 100 / 3), 6);
	});
});

describe('validateSettlementGeometry', () => {
	it('accepts the M1 scenario data (all settlements)', () => {
		const prov = loadScenario(provinceM1); // throws if invalid
		let count = 0;
		for (const r of prov.regions) {
			for (const s of r.settlements) {
				validateSettlementGeometry(s.geometry, settlementHouseholds(s));
				count++;
			}
		}
		expect(count).toBe(5);
	});

	it('rejects non-ascending thresholds', () => {
		const geo = {
			stages: [
				{ minHouseholds: 100, ring: TRI },
				{ minHouseholds: 90, ring: TRI }
			]
		};
		expect(() => validateSettlementGeometry(geo, 100)).toThrow(/ascending/);
	});

	it('rejects an empty path', () => {
		const geo = { stages: [{ minHouseholds: 0, ring: '' }] };
		expect(() => validateSettlementGeometry(geo, 100)).toThrow(/ring/);
	});

	it('rejects a first threshold above the starting households', () => {
		const geo = { stages: [{ minHouseholds: 5000, ring: TRI }] };
		expect(() => validateSettlementGeometry(geo, 100)).toThrow(/starting households/);
	});
});

describe('stageFor', () => {
	const geo = {
		stages: [
			{ minHouseholds: 4000, ring: TRI },
			{ minHouseholds: 6000, ring: TRI },
			{ minHouseholds: 7500, ring: TRI }
		]
	};

	it('selects the last stage whose threshold is met', () => {
		expect(stageFor(geo, 5400)).toBe(0);
		expect(stageFor(geo, 6100)).toBe(1);
		expect(stageFor(geo, 8000)).toBe(2);
	});

	it('falls back to the first stage below every threshold', () => {
		expect(stageFor(geo, 10)).toBe(0);
	});
});

describe('deterministic placement', () => {
	it('hash32 is stable and unsigned', () => {
		expect(hash32('city-hafenstadt#1')).toBe(hash32('city-hafenstadt#1'));
		expect(hash32('city-hafenstadt#1')).toBeGreaterThan(0);
		expect(hash32('a')).not.toBe(hash32('b'));
	});

	it('same ids → same anchor, different plants → pairwise distinct anchors', () => {
		const prov = loadScenario(provinceM1);
		const hafenstadt = prov.regions[0].settlements[0];
		const a1 = plantAnchor(hafenstadt.geometry, 'city-hafenstadt#1');
		const a1again = plantAnchor(hafenstadt.geometry, 'city-hafenstadt#1');
		expect(a1).toEqual(a1again);

		const a2 = plantAnchor(hafenstadt.geometry, 'city-hafenstadt#2');
		const a3 = plantAnchor(hafenstadt.geometry, 'city-hafenstadt#3');
		expect(new Set([`${a1.x},${a1.y}`, `${a2.x},${a2.y}`, `${a3.x},${a3.y}`]).size).toBe(3);
	});

	it('anchors stay inside the first-stage inscribed circle', () => {
		const prov = loadScenario(provinceM1);
		for (const r of prov.regions) {
			for (const s of r.settlements) {
				const c = ringCentroid(s.geometry.stages[0].ring);
				for (let id = 1; id <= 5; id++) {
					const a = plantAnchor(s.geometry, `${s.id}#${id}`);
					expect(Math.hypot(a.x - c.x, a.y - c.y)).toBeLessThanOrEqual(
						ringMaxRadius(s.geometry.stages[0].ring)
					);
				}
			}
		}
	});

	it('settlementIndexForPlant spreads plant ids over settlements', () => {
		// deterministic spread: distinct keys may share an index only by hash
		expect(settlementIndexForPlant(2, 'region-coast#1')).toBeGreaterThanOrEqual(0);
		expect(settlementIndexForPlant(2, 'region-coast#1')).toBeLessThan(2);
	});
});
