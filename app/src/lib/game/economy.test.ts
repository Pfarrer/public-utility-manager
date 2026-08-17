import { describe, expect, it } from 'vitest';
import economyJson from '$lib/data/economy.json';
import { createInitialState, tick } from './sim';
import {
	buildAnnualReport,
	economy,
	loadEconomy,
	moneyRound,
	runEconomy,
	setTariff
} from './economy';
import type { GameState, QuarterDispatch } from './types';

/** Dispatch entry builder for controlled economy tests. */
function dispatchEntry(year: number, quarter: 1 | 2 | 3 | 4, servedKwh: number): QuarterDispatch {
	return {
		regionId: 'region-coast',
		year,
		quarter,
		capacityKw: 300,
		peakKw: 120,
		servedKwh,
		unservedKwh: 0,
		outageHours: 0,
		blackout: false,
		priorityServedKwh: 0
	};
}

/** Fresh state with a chosen clock and dispatch numbers we control. */
function stateWithQuarter(quarter: 1 | 2 | 3 | 4, year = 1891, servedKwh = 12000): GameState {
	const state = createInitialState();
	state.clock = { year, quarter };
	state.systems.dispatch.current = { 'region-coast': dispatchEntry(year, quarter, servedKwh) };
	return state;
}

describe('economy data', () => {
	it('loads the M1 balance data', () => {
		expect(economy.tariffDefault).toBe(0.3);
		expect(economy.fuelPricePerKwh).toBe(0.08);
		expect(economy.wagePerCrewQuarter).toBe(250);
		expect(economy.crisisFuelFactor).toBe(1.5);
		expect(economy.bankruptcyQuarters).toBe(4);
	});

	it('rejects bad data naming the field', () => {
		const broken = structuredClone(economyJson);
		broken.tariffDefault = 0;
		expect(() => loadEconomy(broken)).toThrow(/tariffDefault/);
	});
});

describe('moneyRound', () => {
	it('rounds to cents, half away from zero', () => {
		expect(moneyRound(0.005)).toBe(0.01);
		expect(moneyRound(-0.005)).toBe(-0.01);
		expect(moneyRound(2.675)).toBe(2.68);
		expect(moneyRound(1234.567)).toBe(1234.57);
	});

	it('normalizes -0 to 0', () => {
		expect(Object.is(moneyRound(-0), 0)).toBe(true);
		expect(Object.is(moneyRound(-0.001), 0)).toBe(true);
	});
});

describe('setTariff', () => {
	it('clamps to data bounds and rounds to cents', () => {
		const state = createInitialState();
		setTariff(state, 5);
		expect(state.systems.economy.tariff).toBe(economy.tariffMax);
		setTariff(state, 0.0001);
		expect(state.systems.economy.tariff).toBe(economy.tariffMin);
		setTariff(state, 0.3333);
		expect(state.systems.economy.tariff).toBe(0.33);
	});
});

describe('runEconomy', () => {
	it('spec: 12,000 kWh served at 0.30 €/kWh → revenue 3,600 €', () => {
		const state = stateWithQuarter(2);
		const tx = runEconomy(state);
		const revenue = tx.find((t) => t.kind === 'revenue');
		expect(revenue?.amount).toBe(3600);
	});

	it('spec: 12,000 kWh generated at 0.08 €/kWh with crisis 1.5 → fuel -1,440 €', () => {
		const state = stateWithQuarter(2);
		const tx = runEconomy(state, { crisisFactor: 1.5 });
		const fuel = tx.find((t) => t.kind === 'fuel');
		expect(fuel?.amount).toBe(-1440);
	});

	it('spec: 18 crew at 250 €/quarter → wages -4,500 €', () => {
		const state = stateWithQuarter(2);
		state.systems.construction.plants.push(
			{ id: 1, name: 'A', regionId: 'region-coast', crew: 10, components: [] },
			{ id: 2, name: 'B', regionId: 'region-coast', crew: 8, components: [] }
		);
		const tx = runEconomy(state);
		const wages = tx.find((t) => t.kind === 'wages');
		expect(wages?.amount).toBe(-4500);
	});

	it('books construction completions as memo transactions (no double debit)', () => {
		const state = stateWithQuarter(2);
		const before = state.cash;
		state.systems.construction.completed = [
			{ plantId: 1, componentId: 'generator-50kw', cost: 5000, year: 1891, quarter: 2 }
		];
		const tx = runEconomy(state);
		expect(tx.some((t) => t.kind === 'construction' && t.amount === -5000)).toBe(true);
		// cash only moved by revenue/fuel/wages (12,000 kWh: +3,600 - 960)
		expect(state.cash).toBeCloseTo(before + 3600 - 960, 6);
	});

	it('Q4 settlement produces the annual report; net = Σ transactions', () => {
		const state = stateWithQuarter(4);
		runEconomy(state);
		const report = state.systems.economy.annualReports.at(-1);
		expect(report?.year).toBe(1891);
		expect(report?.totals.revenue).toBe(3600);
		expect(report?.totals.fuel).toBe(-960);
		expect(report?.totals.wages).toBe(0);
		expect(report?.net).toBeCloseTo(2640, 6);
		expect(buildAnnualReport(state, 1891).net).toBeCloseTo(report?.net ?? NaN, 6);
	});

	it('bankruptcy: 4 consecutive negative quarters set game over', () => {
		const state = createInitialState();
		state.cash = -100;
		for (const q of [1, 2, 3, 4] as const) {
			state.clock = { year: 1891, quarter: q };
			state.systems.dispatch.current = { 'region-coast': dispatchEntry(1891, q, 0) };
			runEconomy(state);
		}
		expect(state.gameOver).toBe(true);
		expect(state.systems.economy.negativeCashQuarters).toBe(4);
	});

	it('bankruptcy: a single non-negative quarter resets the counter', () => {
		const state = createInitialState();
		state.cash = -100;
		for (const q of [1, 2, 3] as const) {
			state.clock = { year: 1891, quarter: q };
			state.systems.dispatch.current = { 'region-coast': dispatchEntry(1891, q, 0) };
			runEconomy(state);
		}
		expect(state.systems.economy.negativeCashQuarters).toBe(3);
		state.cash = 500; // positive quarter (e.g. subsidy later; here forced)
		state.clock = { year: 1891, quarter: 4 };
		runEconomy(state);
		expect(state.systems.economy.negativeCashQuarters).toBe(0);
		expect(state.gameOver).toBe(false);
	});
});

describe('tick integration', () => {
	it('no plants → no transactions, cash unchanged, deterministic', () => {
		const a = tick(tick(createInitialState()));
		const b = tick(tick(createInitialState()));
		expect(a).toEqual(b);
		expect(a.systems.economy.transactions).toHaveLength(0);
		expect(a.cash).toBe(0);
	});

	it('settlement with a staffed plant books revenue and wages', async () => {
		const { createPlant } = await import('./plant');
		const state = createInitialState();
		const plant = createPlant(state, 'region-coast', 'Hafenkraftwerk');
		plant.components.push(
			{ id: 100, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
			{ id: 101, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
		);
		plant.crew = 10; // required = 8 + 2 = 10 → staffing factor 1
		const next = tick(state);
		const tx = next.systems.economy.transactions;
		expect(tx.filter((t) => t.kind === 'revenue')).toHaveLength(1);
		const wages = tx.find((t) => t.kind === 'wages');
		expect(wages?.amount).toBe(-2500);
		// 1 engine → 3 slots, 1 generator → 50 kW available
		const coast = next.systems.dispatch.current['region-coast'];
		expect(coast?.capacityKw).toBe(50);
		// revenue + fuel + wages applied to cash
		const revenue = tx.find((t) => t.kind === 'revenue')?.amount ?? 0;
		const fuel = tx.find((t) => t.kind === 'fuel')?.amount ?? 0;
		expect(next.cash).toBeCloseTo(revenue + fuel - 2500, 6);
	});
});
