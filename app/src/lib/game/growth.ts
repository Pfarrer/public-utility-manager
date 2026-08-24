/** Regional growth — adoption of electricity, yearly household & wealth drift (change: add-regional-growth). */

import * as v from 'valibot';
import growthJson from '$lib/data/growth.json';
import { history, tramActive } from './events';
import { WEALTH_CATEGORIES, type Province, type WealthCategory } from './province';
import { province } from './scenario';
import type { GameState, GrowthState, SegmentShare } from './types';

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
	/** Quarterly DC→AC migration rate per segment while `dcAcceptingNew` is off (add-three-phase-power D7). */
	dcPhaseOutPerQuarter: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
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

/** Per-region quarterly adoption inputs, split by current type. */
export interface AdoptionInputs {
	blackout: boolean;
	/** DC tariff and AC tariff ($/kWh). */
	tariff: { dc: number; ac: number };
	satisfaction: number;
	/** Operational AC capacity in the region (kW) — AC adoption needs headroom. */
	acCapacityKw: number;
}

/**
 * Next share pair after one quarter, for one segment (change: add-three-phase-power):
 * - total (dc + ac) grows while there is no blackout AND both side's
 *   conditions hold for the side in question
 * - DC grows while `dcAcceptingNew` is on (or stays), AC grows only with AC
 *   capacity available and tariff.ac ≤ wtp
 * - deadoption applies per side when its own conditions are bad
 * - `dc + ac` stays ≤ 1
 */
export function nextShare(
	share: SegmentShare,
	inputs: AdoptionInputs,
	wtp: number,
	data: GrowthData = growth,
	dcAcceptingNew = true
): SegmentShare {
	const reliable = !inputs.blackout;
	const dcAffordable = inputs.tariff.dc <= wtp;
	const acAffordable = inputs.tariff.ac <= wtp;
	const acAvailable = inputs.acCapacityKw > 0;

	let dc = share.dc;
	let ac = share.ac;

	// AC side: needs its own capacity and affordable tariff; new customers
	// pick the new current type first, within the shared headroom (dc + ac ≤ 1).
	if (acAvailable && acAffordable && reliable) {
		const headroom = Math.max(0, 1 - share.dc - share.ac);
		ac = share.ac + Math.min(data.adoptionRatePerQuarter, headroom);
	}

	// Deadoption on the AC side mirrors DC (unreliable + unaffordable).
	if (!reliable && !acAffordable) {
		ac = clamp01(ac - data.deadoptionRatePerQuarter);
	}

	// DC side: grows while new DC contracts are accepted, within what remains
	// after AC's growth — and never shrinks from growth alone.
	if (dcAcceptingNew) {
		if (reliable && dcAffordable) {
			dc = Math.min(share.dc + data.adoptionRatePerQuarter, Math.max(share.dc, 1 - ac));
		} else if (!reliable && !dcAffordable) {
			dc = clamp01(dc - data.deadoptionRatePerQuarter);
		}
	}

	return { dc, ac };
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
			satisfaction: state.systems.dispatch.satisfaction[region.id] ?? 50,
			acCapacityKw: dispatch.acCapacityKw
		};
		const dcAcceptingNew = state.systems.economy.dcAcceptingNew;
		const acCheaper = inputs.tariff.ac < inputs.tariff.dc;
		for (const settlement of region.settlements) {
			for (const cat of WEALTH_CATEGORIES) {
				const current = g.shares[settlement.id]?.[cat] ?? { dc: 0, ac: 0 };
				const wtp = growth.willingnessToPay[cat];
				const updated = nextShare(current, inputs, wtp, growth, dcAcceptingNew);
				if (!g.shares[settlement.id]) {
					g.shares[settlement.id] = { wealthy: { dc: 0, ac: 0 }, average: { dc: 0, ac: 0 }, poor: { dc: 0, ac: 0 } };
				}
				let share = updated;
				// DC phase-out drift (D7): while no new DC contracts are taken,
				// existing DC customers move to AC — but only when AC capacity
				// is available and AC is strictly cheaper.
				if (!dcAcceptingNew && acCheaper && inputs.acCapacityKw > 0) {
					const migrate = Math.min(share.dc, growth.dcPhaseOutPerQuarter);
					share = { dc: share.dc - migrate, ac: clamp01(share.ac + migrate) };
				}
				g.shares[settlement.id][cat] = share;
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
				const share = g.shares[settlement.id]?.[cat] ?? { dc: 0, ac: 0 };
				weighted += households[cat] * (share.dc + share.ac);
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
				wealthy: { dc: growth.initialShare, ac: 0 },
				average: { dc: growth.initialShare, ac: 0 },
				poor: { dc: growth.initialShare, ac: 0 }
			};
		}
	}
	return { households, shares };
}
