/** Supply vs demand — hourly coverage, blackout accounting, satisfaction (change: add-supply-dispatch). */

import { regionDemandByType } from './demand';
import { tramLoadForRegion } from './events';
import { buildings, plantAvailableCapacity, plantCapacityByType } from './plant';
import type { Province } from './province';
import { createRng } from './rng';
import { province } from './scenario';
import { QUARTER_DAYS } from './constants';
import type { GameState, QuarterDispatch } from './types';

// ---------------------------------------------------------------------------
// Tuning constants (M1; the scaling-decades feature later moves the era factor)
// ---------------------------------------------------------------------------

export const SATISFACTION_TUNING = {
	/** Early-era expectation factor — outages are tolerated (design: 0.2). */
	eraFactor: 0.2,
	/** Satisfaction points lost per outage hour at eraFactor 1. */
	dropPerOutageHour: 4,
	/** Points regained per outage-free quarter. */
	recoveryPerQuarter: 2,
	/** Satisfaction baseline for regions on their first dispatched quarter. */
	initial: 50
} as const;

// ---------------------------------------------------------------------------
// Coverage math
// ---------------------------------------------------------------------------

export interface DispatchResult {
	servedKwh: number;
	unservedKwh: number;
	outageHours: number;
	peakKw: number;
	blackout: boolean;
	/** Priority (contract) energy actually served this quarter (kWh). */
	priorityServedKwh: number;
}

/**
 * Hourly coverage accounting over the quarter's representative day:
 * served = min(demand, capacity) per hour; the rest is unserved energy.
 * A quarter with any unserved energy is a blackout quarter.
 * `priorityKw` is served first (contracts); its unserved share weights
 * double toward dissatisfaction.
 */
export function dispatchQuarter(
	curve: number[],
	capacityKw: number,
	priorityKw = 0
): DispatchResult {
	let servedKwh = 0;
	let unservedKwh = 0;
	let outageHours = 0;
	let peakKw = 0;
	let priorityOutageHours = 0;
	let priorityServedKwh = 0;
	for (const demand of curve) {
		if (demand > peakKw) peakKw = demand;
		const servedHour = Math.min(demand, capacityKw);
		servedKwh += servedHour;
		priorityServedKwh += Math.min(priorityKw, servedHour);
		unservedKwh += demand - servedHour;
		if (demand > capacityKw) {
			outageHours += 1;
			if (priorityKw > 0) {
				// Contract energy that could not be served in this hour —
				// counts double toward dissatisfaction.
				priorityOutageHours += 1;
			}
		}
	}
	return {
		servedKwh,
		unservedKwh,
		outageHours: outageHours + priorityOutageHours, // doubled contract outage hours
		peakKw,
		blackout: unservedKwh > 0,
		priorityServedKwh
	};
}

// ---------------------------------------------------------------------------
// Satisfaction
// ---------------------------------------------------------------------------

/**
 * Satisfaction update for one quarter: drops proportionally to outage hours
 * scaled by the era expectation factor; recovers by a fixed rate without
 * outages. Bounded to [0, 100].
 */
export function updateSatisfaction(
	current: number,
	result: Pick<DispatchResult, 'outageHours' | 'blackout'>
): number {
	let next = current;
	if (result.blackout) {
		next -= result.outageHours * SATISFACTION_TUNING.dropPerOutageHour * SATISFACTION_TUNING.eraFactor;
	} else {
		next += SATISFACTION_TUNING.recoveryPerQuarter;
	}
	return Math.min(100, Math.max(0, next));
}

// ---------------------------------------------------------------------------
// System steps (run inside the sim tick: demand → dispatch)
// ---------------------------------------------------------------------------

/**
 * Demand step: compute this quarter's 24h curves for every unlocked region
 * from the *connected* households (living × electrification share, growth
 * system). Consumes the state RNG (group jitter) in deterministic order and
 * writes the advanced cursor back into the state.
 */
export function runDemand(state: GameState, prov: Province = province): void {
	const rng = createRng(state.rngState);
	const current: Record<string, number[]> = {};
	const currentByType: Record<string, { dc: number[]; ac: number[] }> = {};
	const g = state.systems.growth;
	for (const region of prov.regions) {
		if (!region.unlocked) continue;
		const tram = tramLoadForRegion(state, region.id);
		const byType = regionDemandByType(region, rng, {
			households: g.households,
			shares: g.shares
		});
		// The tram is a DC consumer (600 V DC network; its supply conversion is
		// a follow-up change) — its load rides on the DC pool.
		const dcCurve = tram > 0 ? byType.dc.curve.map((kw) => kw + tram) : byType.dc.curve;
		currentByType[region.id] = { dc: dcCurve, ac: byType.ac.curve };
		current[region.id] = dcCurve.map((kw, h) => kw + byType.ac.curve[h]);
	}
	state.rngState = rng.a >>> 0;
	state.systems.demand.current = current;
	state.systems.demand.currentByType = currentByType;
}

/**
 * Dispatch step: match available capacity (Σ plant available capacity in the
 * region) against the demand curve, record the quarter result, and update
 * per-region satisfaction.
 */
export function runDispatch(state: GameState, prov: Province = province): void {
	const dispatch = state.systems.dispatch;
	dispatch.current = {};
	for (const region of prov.regions) {
		if (!region.unlocked) continue;
		const byType = state.systems.demand.currentByType[region.id] ?? { dc: [], ac: [] };
		const plants = state.systems.construction.plants.filter((p) => p.regionId === region.id);
		const capacityKw = plants.reduce((sum, p) => sum + plantAvailableCapacity(p, buildings), 0);
		const byTypeCap = plants.reduce(
			(acc, p) => {
				const t = plantCapacityByType(p, buildings);
				acc.dc += t.dc;
				acc.ac += t.ac;
				return acc;
			},
			{ dc: 0, ac: 0 }
		);
		const priorityKw = tramLoadForRegion(state, region.id);
		// Separate pools (change: add-three-phase-power): DC demand is served
		// from DC capacity only, AC demand from AC capacity only — the two
		// current types are separate physical networks in the same region.
		const dcResult = dispatchQuarter(byType.dc, byTypeCap.dc, priorityKw);
		const acResult = dispatchQuarter(byType.ac, byTypeCap.ac, 0);
		// dispatchQuarter accounts the representative 24-h day; the quarter
		// bills QUARTER_DAYS of it. Energy fields scale up, power fields
		// (peak/capacity) and hour counts stay on the day basis.
		const servedKwh = (dcResult.servedKwh + acResult.servedKwh) * QUARTER_DAYS;
		const unservedKwh = (dcResult.unservedKwh + acResult.unservedKwh) * QUARTER_DAYS;
		const entry: QuarterDispatch = {
			regionId: region.id,
			year: state.clock.year,
			quarter: state.clock.quarter,
			capacityKw,
			dcCapacityKw: byTypeCap.dc,
			acCapacityKw: byTypeCap.ac,
			peakKw: Math.max(dcResult.peakKw, acResult.peakKw),
			dcPeakKw: dcResult.peakKw,
			acPeakKw: acResult.peakKw,
			servedKwh,
			dcServedKwh: dcResult.servedKwh * QUARTER_DAYS,
			acServedKwh: acResult.servedKwh * QUARTER_DAYS,
			unservedKwh,
			dcUnservedKwh: dcResult.unservedKwh * QUARTER_DAYS,
			acUnservedKwh: acResult.unservedKwh * QUARTER_DAYS,
			outageHours: dcResult.outageHours + acResult.outageHours,
			blackout: dcResult.blackout || acResult.blackout,
			priorityServedKwh: dcResult.priorityServedKwh * QUARTER_DAYS
		};
		dispatch.current[region.id] = entry;
		dispatch.history.push(entry);
		const previous = dispatch.satisfaction[region.id] ?? SATISFACTION_TUNING.initial;
		dispatch.satisfaction[region.id] = updateSatisfaction(previous, {
			blackout: entry.blackout,
			outageHours: entry.outageHours
		});
	}
}
