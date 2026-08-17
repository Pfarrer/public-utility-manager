/** Regional growth — adoption of electricity, yearly household & wealth drift (change: add-regional-growth). */

import * as v from 'valibot';
import growthJson from '$lib/data/growth.json';
import { history, tramActive } from './events';
import { WEALTH_CATEGORIES, type Province, type WealthCategory } from './province';
import { province } from './scenario';
import type { GameState, GrowthState } from './types';

// ---------------------------------------------------------------------------
// Balance data (JSON + valibot, fail-fast)
// ---------------------------------------------------------------------------

const GrowthSchema = v.object({
	initialShare: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	willingnessToPay: v.object({
		wealthy: v.pipe(v.number(), v.minValue(0.01)),
		average: v.pipe(v.number(), v.minValue(0.01)),
		poor: v.pipe(v.number(), v.minValue(0.01))
	}),
	adoptionRatePerQuarter: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	deadoptionRatePerQuarter: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	householdGrowthBasePerYear: v.pipe(v.number(), v.minValue(0)),
	wealthDriftPerYear: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	driftSatisfactionThreshold: v.pipe(v.number(), v.minValue(0), v.maxValue(100))
});

export type GrowthData = v.InferOutput<typeof GrowthSchema>;

/** Validate growth balance data. Throws naming the offending field. */
export function loadGrowth(data: unknown): GrowthData {
	const result = v.safeParse(GrowthSchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid growth data at '${path}': ${issue.message}`);
	}
	return result.output;
}

/** The M1 growth balance data (loaded once at module init, fail-fast). */
export const growth: GrowthData = loadGrowth(growthJson);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

// ---------------------------------------------------------------------------
// Adoption (quarterly)
// ---------------------------------------------------------------------------

/** Per-region quarterly adoption inputs. */
export interface AdoptionInputs {
	blackout: boolean;
	tariff: number;
	satisfaction: number;
}

/**
 * Next share after one quarter, for one segment:
 * - grows while there is no blackout AND tariff ≤ segment willingness-to-pay
 * - stalls (unchanged) with only one bad factor
 * - with both bad factors it shrinks slightly (deadoption)
 */
export function nextShare(
	share: number,
	inputs: AdoptionInputs,
	wtp: number,
	data: GrowthData = growth
): number {
	const reliable = !inputs.blackout;
	const affordable = inputs.tariff <= wtp;
	if (reliable && affordable) {
		return clamp01(share + data.adoptionRatePerQuarter);
	}
	if (!reliable && !affordable) {
		return clamp01(share - data.deadoptionRatePerQuarter);
	}
	return share;
}

// ---------------------------------------------------------------------------
// System steps
// ---------------------------------------------------------------------------

/**
 * Growth step (quarterly adoption): update each settlement's per-segment
 * electrification share from the region's dispatch result, tariff, and
 * satisfaction. Runs inside the tick after dispatch.
 */
export function runGrowth(state: GameState, prov: Province = province): void {
	const g = state.systems.growth;
	for (const region of prov.regions) {
		if (!region.unlocked) continue;
		const dispatch = state.systems.dispatch.current[region.id];
		if (!dispatch) continue;
		const inputs: AdoptionInputs = {
			blackout: dispatch.blackout,
			tariff: state.systems.economy.tariff,
			satisfaction: state.systems.dispatch.satisfaction[region.id] ?? 50
		};
		for (const settlement of region.settlements) {
			for (const cat of WEALTH_CATEGORIES) {
				const current = g.shares[settlement.id]?.[cat] ?? 0;
				const wtp = growth.willingnessToPay[cat];
				const updated = nextShare(current, inputs, wtp);
				if (!g.shares[settlement.id]) g.shares[settlement.id] = { wealthy: 0, average: 0, poor: 0 };
				g.shares[settlement.id][cat] = updated;
			}
		}
	}
}

/**
 * Yearly growth: runs after Q4 (from the tick wrapper when the *settled*
 * quarter was 4). Households multiply by (1 + base) scaled by the region's
 * electrification and satisfaction; a small share of households moves up one
 * wealth category when satisfaction ≥ threshold, conserving totals.
 */
export function yearlyGrowth(state: GameState, prov: Province = province): void {
	const g = state.systems.growth;
	for (const region of prov.regions) {
		if (!region.unlocked) continue;
		const satisfaction = state.systems.dispatch.satisfaction[region.id] ?? 50;
		// Region electrification (household-weighted average of segment shares).
		let weighted = 0;
		let total = 0;
		for (const settlement of region.settlements) {
			const households = g.households[settlement.id];
			if (!households) continue;
			for (const cat of WEALTH_CATEGORIES) {
				weighted += households[cat] * (g.shares[settlement.id]?.[cat] ?? 0);
				total += households[cat];
			}
		}
		const electrification = total > 0 ? weighted / total : 0;
		const scale = electrification * (satisfaction / 100);
		for (const settlement of region.settlements) {
			const households = g.households[settlement.id];
			if (!households) continue;
			// 1) Household growth, scaled by electrification & satisfaction;
			//    an active tram contract boosts its settlements' growth.
			const boost =
				tramActive(state) && history.tramDeal.settlementIds.includes(settlement.id)
					? history.tramDeal.growthBoost
					: 1;
			const additions = Math.floor(
				householdTotal(households) * growth.householdGrowthBasePerYear * scale * boost
			);
			households.poor += additions;
			// 2) Wealth drift: move driftShare of each category up one level
			//    when satisfaction ≥ threshold (conserves totals).
			if (satisfaction >= growth.driftSatisfactionThreshold) {
				const drift = (cat: WealthCategory): number =>
					Math.floor(households[cat] * growth.wealthDriftPerYear);
				households.wealthy += drift('average');
				households.average += -drift('average') + drift('poor');
				households.poor -= drift('poor');
			}
		}
	}
}

function householdTotal(segments: { wealthy: number; average: number; poor: number }): number {
	return segments.wealthy + segments.average + segments.poor;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initialize the growth state: copy each settlement's household counts from
 * the scenario and set every segment's share to the initial share.
 */
export function initGrowth(prov: Province = province): GrowthState {
	const households: GrowthState['households'] = {};
	const shares: GrowthState['shares'] = {};
	for (const region of prov.regions) {
		for (const settlement of region.settlements) {
			households[settlement.id] = structuredClone(settlement.households);
			shares[settlement.id] = {
				wealthy: growth.initialShare,
				average: growth.initialShare,
				poor: growth.initialShare
			};
		}
	}
	return { households, shares };
}
