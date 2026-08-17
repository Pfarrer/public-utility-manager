/** Economy — tariffs, costs, quarterly settlement, annual report, bankruptcy (change: add-economy). */

import * as v from 'valibot';
import economyJson from '$lib/data/economy.json';
import type { AnnualReport, GameState, Transaction, TransactionKind } from './types';

// ---------------------------------------------------------------------------
// Balance data (JSON + valibot, fail-fast)
// ---------------------------------------------------------------------------

const EconomySchema = v.object({
	tariffDefault: v.pipe(v.number(), v.minValue(0.01)),
	tariffMin: v.pipe(v.number(), v.minValue(0.01)),
	tariffMax: v.pipe(v.number(), v.minValue(0.01)),
	fuelPricePerKwh: v.pipe(v.number(), v.minValue(0.01)),
	wagePerCrewQuarter: v.pipe(v.number(), v.minValue(0)),
	crisisFuelFactor: v.pipe(v.number(), v.minValue(1)),
	bankruptcyQuarters: v.pipe(v.number(), v.integer(), v.minValue(1))
});

export type EconomyData = v.InferOutput<typeof EconomySchema>;

/** Validate economy balance data. Throws naming the offending field. */
export function loadEconomy(data: unknown): EconomyData {
	const result = v.safeParse(EconomySchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid economy data at '${path}': ${issue.message}`);
	}
	return result.output;
}

/** The M1 balance data (loaded once at module init, fail-fast). */
export const economy: EconomyData = loadEconomy(economyJson);

// ---------------------------------------------------------------------------
// Money helper
// ---------------------------------------------------------------------------

/**
 * Round to cents, half away from zero; normalizes `-0` to `0`.
 * All cash arithmetic in the game goes through this.
 */
export function moneyRound(value: number): number {
	return Math.round((value + Math.sign(value) * Number.EPSILON) * 100) / 100 + 0;
}

// ---------------------------------------------------------------------------
// Player action
// ---------------------------------------------------------------------------

/** Set the tariff (€/kWh), clamped to the data bounds and rounded to cents. */
export function setTariff(state: GameState, tariff: number): void {
	const clamped = Math.min(economy.tariffMax, Math.max(economy.tariffMin, tariff));
	state.systems.economy.tariff = moneyRound(clamped);
}

// ---------------------------------------------------------------------------
// Quarterly settlement
// ---------------------------------------------------------------------------

/** Per-tick inputs; the game-events system computes the crisis factor. */
export interface QuarterInputs {
	/** Active fuel crisis factor (1 = none) multiplying the base fuel price. */
	crisisFactor?: number;
}

/**
 * Settle the quarter: book revenue (served kWh × tariff), fuel (generated kWh
 * × fuel price × crisis factor — in M1 plants generate exactly what is
 * served), and wages (Σ staffed crew × quarterly wage) as transactions and
 * apply them to cash. Construction completions are booked as memo
 * transactions (cash was already debited on delivery by the construction
 * system) so the annual report is complete.
 *
 * Afterwards: bankruptcy counter update (game over after `bankruptcyQuarters`
 * consecutive negative-cash quarters, reset by a non-negative quarter) and,
 * after Q4, the annual report.
 */
export function runEconomy(state: GameState, inputs: QuarterInputs = {}): Transaction[] {
	const eco = state.systems.economy;
	const crisis = inputs.crisisFactor ?? 1;
	const { year, quarter } = state.clock;

	const servedKwh = Object.values(state.systems.dispatch.current).reduce(
		(sum, d) => sum + d.servedKwh,
		0
	);
	// Contract (tram) energy is billed at the contract's tariff share.
	let priorityKwh = 0;
	for (const d of Object.values(state.systems.dispatch.current)) {
		if (d.priorityServedKwh > 0) priorityKwh = d.priorityServedKwh; // single deal region in M1
	}
	const contractTariff = state.systems.economy.tariff * state.systems.events.tram.tariffShare;
	const householdKwh = Math.max(0, servedKwh - priorityKwh);
	const crew = state.systems.construction.plants.reduce((sum, p) => sum + p.crew, 0);

	const transactions: Transaction[] = [];
	const book = (kind: TransactionKind, amount: number) => {
		const rounded = moneyRound(amount);
		if (rounded === 0) return; // zero amounts don't clutter the ledger
		transactions.push({ year, quarter, kind, amount: rounded });
	};

	book('revenue', householdKwh * eco.tariff + priorityKwh * contractTariff);
	book('fuel', -(servedKwh * economy.fuelPricePerKwh * crisis));
	book('wages', -(crew * economy.wagePerCrewQuarter));
	for (const completion of state.systems.construction.completed) {
		book('construction', -completion.cost);
	}

	for (const t of transactions) {
		if (t.kind === 'construction') continue; // memo only — debited on delivery
		state.cash = moneyRound(state.cash + t.amount);
	}

	// Bankruptcy tracking: a non-negative quarter resets the counter.
	if (state.cash < 0) eco.negativeCashQuarters += 1;
	else eco.negativeCashQuarters = 0;
	if (eco.negativeCashQuarters >= economy.bankruptcyQuarters) state.gameOver = true;

	eco.transactions.push(...transactions);
	if (quarter === 4) eco.annualReports.push(buildAnnualReport(state, year));
	return transactions;
}

/** Aggregate one year's ledger into an itemized report with the net result. */
export function buildAnnualReport(state: GameState, year: number): AnnualReport {
	const totals: Record<TransactionKind, number> = {
		revenue: 0,
		fuel: 0,
		wages: 0,
		construction: 0
	};
	let net = 0;
	for (const t of state.systems.economy.transactions) {
		if (t.year !== year) continue;
		totals[t.kind] = moneyRound(totals[t.kind] + t.amount);
		net = moneyRound(net + t.amount);
	}
	return { year, totals, net };
}
