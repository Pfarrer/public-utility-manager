/** Harmonic load profiles, seeded jitter, region aggregation (change: add-demand-profiles). */

import * as v from 'valibot';
import profilesJson from '$lib/data/profiles.json';
import { WEALTH_CATEGORIES, type Region, type WealthCategory, type WealthSegments } from './province';
import { drawFloat, type RngState } from './rng';
import type { SegmentShare } from './types';

// ---------------------------------------------------------------------------
// Profile math
// ---------------------------------------------------------------------------

/**
 * One harmonic term: amplitude · cos(2π · frequency · (h − phaseHours) / 24).
 * `phaseHours` is the hour of the term's maximum (positive amplitude).
 */
export interface HarmonicTerm {
	amplitude: number;
	frequency: number;
	phaseHours: number;
}

export interface LoadProfile {
	baseKw: number;
	terms: HarmonicTerm[];
}

/** Evaluate a profile at hour h (0..23); result is clamped to non-negative kW. */
export function evaluateProfile(profile: LoadProfile, hour: number): number {
	let value = profile.baseKw;
	for (const t of profile.terms) {
		value += t.amplitude * Math.cos((2 * Math.PI * t.frequency * (hour - t.phaseHours)) / 24);
	}
	return Math.max(0, value);
}

/** Full 24-hour curve of a profile (kW per unit). */
export function profileCurve(profile: LoadProfile): number[] {
	return Array.from({ length: 24 }, (_, h) => evaluateProfile(profile, h));
}

// ---------------------------------------------------------------------------
// Data (JSON + valibot, fail-fast)
// ---------------------------------------------------------------------------

const HarmonicTermSchema = v.object({
	amplitude: v.number(),
	frequency: v.pipe(v.number(), v.minValue(0.01)),
	phaseHours: v.number()
});

const LoadProfileSchema = v.object({
	baseKw: v.pipe(v.number(), v.minValue(0)),
	terms: v.pipe(v.array(HarmonicTermSchema), v.minLength(1))
});

const ProfilesSchema = v.object({
	household: LoadProfileSchema,
	wealthFactor: v.object({
		wealthy: v.pipe(v.number(), v.minValue(0.01)),
		average: v.pipe(v.number(), v.minValue(0.01)),
		poor: v.pipe(v.number(), v.minValue(0.01))
	}),
	business: LoadProfileSchema,
	seasonMultiplier: v.pipe(v.array(v.pipe(v.number(), v.minValue(0.01))), v.length(4)),
	jitter: v.object({
		amplitudeBound: v.pipe(v.number(), v.minValue(0)),
		phaseBoundHours: v.pipe(v.number(), v.minValue(0))
	})
});

export interface Profiles {
	household: LoadProfile;
	wealthFactor: Record<WealthCategory, number>;
	business: LoadProfile;
	seasonMultiplier: number[];
	jitter: { amplitudeBound: number; phaseBoundHours: number };
}

/** Validate and load profile definitions. Throws naming the offending field. */
export function loadProfiles(data: unknown): Profiles {
	const result = v.safeParse(ProfilesSchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid profiles data at '${path}': ${issue.message}`);
	}
	return result.output;
}

/** The M1 profile definitions (loaded once at module init, fail-fast). */
export const profiles: Profiles = loadProfiles(profilesJson);

// ---------------------------------------------------------------------------
// Seeded group jitter
// ---------------------------------------------------------------------------

export interface GroupJitter {
	/** Multiplier for all term amplitudes, within [1 − bound, 1 + bound]. */
	amplitudeScale: number;
	/** Shift added to all term phases, within ± phaseBoundHours. */
	phaseShiftHours: number;
}

/** Draw a group's jitter from the sim RNG (amplitude first, then phase). */
export function drawJitter(rng: RngState, bounds = profiles.jitter): GroupJitter {
	const amp = 1 + (drawFloat(rng) * 2 - 1) * bounds.amplitudeBound;
	const phase = (drawFloat(rng) * 2 - 1) * bounds.phaseBoundHours;
	return { amplitudeScale: amp, phaseShiftHours: phase };
}

/** Apply jitter to a profile (returns a new profile; no mutation). */
export function applyJitter(profile: LoadProfile, jitter: GroupJitter): LoadProfile {
	return {
		baseKw: profile.baseKw,
		terms: profile.terms.map((t) => ({
			amplitude: t.amplitude * jitter.amplitudeScale,
			frequency: t.frequency,
			phaseHours: t.phaseHours + jitter.phaseShiftHours
		}))
	};
}

// ---------------------------------------------------------------------------
// Group curves & region aggregation
// ---------------------------------------------------------------------------

/** kW curve of `households` households of one wealth category (with jitter). */
export function householdGroupCurve(
	households: number,
	category: WealthCategory,
	jitter: GroupJitter | null,
	defs: Profiles = profiles
): number[] {
	const scaled = jitter ? applyJitter(defs.household, jitter) : defs.household;
	const factor = defs.wealthFactor[category];
	return profileCurve(scaled).map((kw) => kw * households * factor);
}

/** kW curve of `count` businesses (with jitter). */
export function businessGroupCurve(
	count: number,
	jitter: GroupJitter | null,
	defs: Profiles = profiles
): number[] {
	const scaled = jitter ? applyJitter(defs.business, jitter) : defs.business;
	return profileCurve(scaled).map((kw) => kw * count);
}

export interface QuarterDemand {
	/** 24 hourly kW values of the representative day. */
	curve: number[];
	/** Maximum of the curve (kW). */
	peakKw: number;
	/** Sum of the curve (kWh of the representative day). */
	energyKwh: number;
}

/** Aggregate arbitrary group curves: element-wise sum, peak and energy derived. */
export function aggregate(curves: number[][]): QuarterDemand {
	const curve = new Array<number>(24).fill(0);
	for (const c of curves) {
		for (let h = 0; h < 24; h++) curve[h] += c[h];
	}
	return {
		curve,
		peakKw: Math.max(...curve),
		energyKwh: curve.reduce((sum, kw) => sum + kw, 0)
	};
}

/**
 * Region demand of the representative day: one group per
 * (settlement × wealth category, connected households > 0) plus optional
 * businesses. Connected households = living households × electrification
 * share (growth system). Jitter is drawn per group in deterministic order
 * (settlement, then category).
 */
export function regionDemand(
	region: Region,
	rng: RngState,
	options: {
		businessCount?: number;
		defs?: Profiles;
		/** Living households per settlement id × category (growth system). */
		households?: Record<string, WealthSegments>;
		/** Electrification share per settlement id × category (growth system; dc + ac summed for demand). */
		shares?: Record<string, Record<WealthCategory, number | SegmentShare>>;
	} = {}
): QuarterDemand {
	const defs = options.defs ?? profiles;
	const curves: number[][] = [];
	for (const settlement of region.settlements) {
		for (const category of WEALTH_CATEGORIES) {
			const living = options.households?.[settlement.id]?.[category] ?? settlement.households[category];
			const raw = options.shares?.[settlement.id]?.[category] ?? 1;
			const share = typeof raw === 'number' ? raw : raw.dc + raw.ac;
			const connected = living * share;
			if (connected <= 0) continue;
			curves.push(householdGroupCurve(connected, category, drawJitter(rng, defs.jitter), defs));
		}
	}
	const businessCount = options.businessCount ?? 0;
	if (businessCount > 0) {
		curves.push(businessGroupCurve(businessCount, drawJitter(rng, defs.jitter), defs));
	}
	return aggregate(curves);
}
