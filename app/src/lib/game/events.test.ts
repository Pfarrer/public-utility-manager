import { describe, expect, it } from 'vitest';
import historyJson from '$lib/data/history.json';
import { createInitialState, tick } from './sim';
import {
	announcesCrisis,
	assembleNewspaper,
	crisisFactor,
	decideTram,
	headlineFor,
	history,
	initEvents,
	loadHistory,
	pushMessage,
	runEvents,
	tramActive,
	tramLoadForRegion
} from './events';
import type { GameState } from './types';

/** Fast-forward a state to the start of a given year (settles prior quarters). */
function atYear(year: number, base: GameState = createInitialState()): GameState {
	let s = base;
	while (s.clock.year < year) s = tick(s);
	return s;
}

describe('history data', () => {
	it('loads with headlines for every year 1890–1900', () => {
		expect(history.headlines).toHaveLength(11);
		const years = history.headlines.map((h) => h.year);
		expect(years).toContain(1891);
		expect(years).toContain(1900);
	});

	it('crisis is announced one year before it starts', () => {
		expect(history.crisis.startYear).toBe(history.crisis.announceYear + 1);
	});

	it('rejects duplicate headline years', () => {
		const broken = structuredClone(historyJson);
		broken.headlines.push({ ...broken.headlines[0] });
		expect(() => loadHistory(broken)).toThrow(/unique/);
	});

	it('rejects bad tram data naming the field', () => {
		const broken = structuredClone(historyJson);
		broken.tramDeal.loadKw = -1;
		expect(() => loadHistory(broken)).toThrow(/loadKw/);
	});
});

describe('newspaper', () => {
	it('spec: year with entry — newspaper for 1891 lists that headline', () => {
		expect(headlineFor(1891)).toContain('Lauffen');
		const state = createInitialState();
		pushMessage(state, 'Testmeldung');
		state.systems.events.messages[0].year = 1891;
		const paper = assembleNewspaper(state, 1891);
		expect(paper.year).toBe(1891);
		expect(paper.headline).toBe(headlineFor(1891));
		expect(paper.messages).toHaveLength(1);
	});

	it('runEvents assembles the newspaper when settled quarter is Q4', () => {
		const state = atYear(1891); // settles 1890 Q4 on the last tick
		expect(state.systems.events.newspapers).toHaveLength(1);
		expect(state.systems.events.newspapers[0].year).toBe(1890);
	});

	it('crisis telegraph appears in the 1893 newspaper messages', () => {
		const state = atYear(1894); // settles 1893 Q4
		const paper = state.systems.events.newspapers.find((n) => n.year === 1893);
		expect(paper).toBeDefined();
		const telegraph = paper?.messages.find((m) => m.text.includes('Telegraph'));
		expect(telegraph).toBeDefined();
	});
});

describe('crisis timing', () => {
	it('spec: fuel factor applies only from the start year', () => {
		expect(crisisFactor(1892)).toBe(1);
		expect(crisisFactor(1893)).toBe(1);
		expect(crisisFactor(1894)).toBe(1.5);
		expect(crisisFactor(1900)).toBe(1.5);
	});

	it('spec: 1893 announcement multiplies nothing in 1893', () => {
		expect(announcesCrisis(1893)).toBe(true);
		expect(announcesCrisis(1892)).toBe(false);
		expect(announcesCrisis(1894)).toBe(false);
	});
});

describe('tram deal', () => {
	it('offer appears in year 2 (1891)', () => {
		const state = atYear(1891);
		expect(state.systems.events.tram.phase).toBe('offered');
		expect(state.systems.events.tram.tariffShare).toBe(0.7);
	});

	it('spec: accept adds flat load and activates the contract', () => {
		const state = atYear(1891);
		decideTram(state, true);
		expect(tramActive(state)).toBe(true);
		expect(tramLoadForRegion(state, 'region-coast')).toBe(80);
		expect(tramLoadForRegion(state, 'region-mountains')).toBe(0);
		const next = tick(state);
		// 80 kW × 24 h added to the coast curve every hour
		const coast = next.systems.dispatch.current['region-coast'];
		expect(coast?.peakKw).toBeGreaterThanOrEqual(80);
		expect(coast?.priorityServedKwh).toBeLessThanOrEqual(80 * 24);
	});

	it('spec: reject + successful re-offer roll presents 0.8 offer next year', () => {
		const state = atYear(1891);
		const rngBefore = state.rngState;
		decideTram(state, false);
		const granted = state.systems.events.tram.reofferGranted;
		// the roll consumed exactly one RNG draw
		expect(state.rngState).not.toBe(rngBefore);
		if (granted) {
			const next = atYear(1892, state);
			expect(next.systems.events.tram.phase).toBe('reoffered');
			expect(next.systems.events.tram.tariffShare).toBe(0.8);
			// second rejection ends negotiations
			decideTram(next, false);
			expect(next.systems.events.tram.phase).toBe('rejectedFinal');
		} else {
			expect(state.systems.events.tram.phase).toBe('rejectedFinal');
		}
	});

	it('contract closes after 5 years', () => {
		const state = atYear(1891);
		decideTram(state, true);
		const during = atYear(1895, state);
		expect(tramActive(during)).toBe(true);
		const after = atYear(1897, state);
		expect(after.systems.events.tram.phase).toBe('closed');
	});

	it('decideTram ignores decisions outside offered/reoffered', () => {
		const state = createInitialState();
		expect(state.systems.events.tram.phase).toBe('pending');
		decideTram(state, true);
		expect(state.systems.events.tram.phase).toBe('pending');
	});
});

describe('dispatch obligation weighting', () => {
	it('spec: blackout with contract weights outage hours double', async () => {
		const { dispatchQuarter } = await import('./dispatch');
		const curve = [100, 100, 50, 20, 10];
		// no contract: plain outage accounting
		const plain = dispatchQuarter(curve, 50);
		expect(plain.outageHours).toBe(2);
		// with a 30 kW contract: outage hours doubled
		const withContract = dispatchQuarter(curve, 50, 30);
		expect(withContract.outageHours).toBe(4);
		expect(withContract.priorityServedKwh).toBe(30 * 3 + 20 + 10);
		// served total unchanged by priority
		expect(withContract.servedKwh).toBe(plain.servedKwh);
	});
});

describe('economy × events integration', () => {
	it('accepted contract bills priority kWh at the contract tariff share', async () => {
		const { createPlant } = await import('./plant');
		const state = atYear(1891);
		decideTram(state, true);
		// give the region a staffed plant so there is served energy to bill
		const plant = createPlant(state, 'region-coast', 'Hafenkraftwerk');
		plant.components.push(
			{ id: 100, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
			{ id: 101, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
		);
		plant.crew = 10;
		const next = tick(state);
		const tx = next.systems.economy.transactions;
		const revenue = tx.find((t) => t.kind === 'revenue');
		expect(revenue).toBeDefined();
		// contract energy at 0.7 × 0.30 = 0.21 €/kWh, household energy at 0.30
		const coast = next.systems.dispatch.current['region-coast'];
		const priority = coast?.priorityServedKwh ?? 0;
		const household = (coast?.servedKwh ?? 0) - priority;
		expect(priority).toBeGreaterThan(0);
		expect(revenue?.amount).toBeCloseTo(
			household * 0.3 + priority * 0.3 * 0.7,
			4
		);
	});

	it('newspaper includes the contract message of its year', () => {
		const state = atYear(1891);
		decideTram(state, true);
		const next = atYear(1892, state); // settles 1891 Q4
		const paper = next.systems.events.newspapers.find((n) => n.year === 1891);
		expect(paper?.messages.some((m) => m.text.includes('Straßenbahn'))).toBe(true);
	});
});
