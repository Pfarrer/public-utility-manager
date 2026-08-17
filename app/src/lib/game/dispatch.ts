/** Supply vs demand — hourly coverage, blackout accounting, satisfaction (change: add-supply-dispatch). */

import { regionDemand } from './demand';
import { buildings, plantAvailableCapacity } from './plant';
import type { Province } from './province';
import { createRng } from './rng';
import { province } from './scenario';
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
}

/**
 * Hourly coverage accounting over the quarter's representative day:
 * served = min(demand, capacity) per hour; the rest is unserved energy.
 * A quarter with any unserved energy is a blackout quarter.
 */
export function dispatchQuarter(curve: number[], capacityKw: number): DispatchResult {
	let servedKwh = 0;
	let unservedKwh = 0;
	let outageHours = 0;
	let peakKw = 0;
	for (const demand of curve) {
		if (demand > peakKw) peakKw = demand;
		const servedHour = Math.min(demand, capacityKw);
		servedKwh += servedHour;
		unservedKwh += demand - servedHour;
		if (demand > capacityKw) outageHours += 1;
	}
	return { servedKwh, unservedKwh, outageHours, peakKw, blackout: unservedKwh > 0 };
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
 * Demand step: compute this quarter's 24h curves for every unlocked region.
 * Consumes the state RNG (group jitter) in deterministic order and writes the
 * advanced cursor back into the state.
 */
export function runDemand(state: GameState, prov: Province = province): void {
	const rng = createRng(state.rngState);
	const current: Record<string, number[]> = {};
	for (const region of prov.regions) {
		if (!region.unlocked) continue;
		current[region.id] = regionDemand(region, rng).curve;
	}
	state.rngState = rng.a >>> 0;
	state.systems.demand.current = current;
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
		const curve = state.systems.demand.current[region.id] ?? [];
		const capacityKw = state.systems.construction.plants
			.filter((p) => p.regionId === region.id)
			.reduce((sum, p) => sum + plantAvailableCapacity(p, buildings), 0);
		const result = dispatchQuarter(curve, capacityKw);
		const entry: QuarterDispatch = {
			regionId: region.id,
			year: state.clock.year,
			quarter: state.clock.quarter,
			capacityKw,
			peakKw: result.peakKw,
			servedKwh: result.servedKwh,
			unservedKwh: result.unservedKwh,
			outageHours: result.outageHours,
			blackout: result.blackout
		};
		dispatch.current[region.id] = entry;
		dispatch.history.push(entry);
		const previous = dispatch.satisfaction[region.id] ?? SATISFACTION_TUNING.initial;
		dispatch.satisfaction[region.id] = updateSatisfaction(previous, result);
	}
}
