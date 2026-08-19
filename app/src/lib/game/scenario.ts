/** Scenario loading — valibot-validated, fail-fast (change: add-province-model). */

import * as v from 'valibot';
import provinceJson from '$lib/data/province-m1.json';
import { validateSettlementGeometry } from './geometry';
import { settlementHouseholds, type Province } from './province';

/** Schema mirrors the `Province` type; load-time validation, fail-fast. */
const WealthSegmentsSchema = v.object({
	wealthy: v.pipe(v.number(), v.integer(), v.minValue(0)),
	average: v.pipe(v.number(), v.integer(), v.minValue(0)),
	poor: v.pipe(v.number(), v.integer(), v.minValue(0))
});

const StageRingSchema = v.object({
	minHouseholds: v.pipe(v.number(), v.integer(), v.minValue(0)),
	ring: v.pipe(v.string(), v.minLength(1))
});

const SettlementGeometrySchema = v.object({
	comment: v.optional(v.string()),
	stages: v.pipe(v.array(StageRingSchema), v.minLength(1))
});

const SettlementSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1)),
	name: v.pipe(v.string(), v.minLength(1)),
	type: v.picklist(['city', 'village']),
	population: v.pipe(v.number(), v.integer(), v.minValue(0)),
	households: WealthSegmentsSchema,
	geometry: SettlementGeometrySchema
});

const RegionSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1)),
	name: v.pipe(v.string(), v.minLength(1)),
	terrain: v.picklist(['coast', 'mountains', 'highland', 'farmland']),
	unlocked: v.boolean(),
	settlements: v.pipe(v.array(SettlementSchema), v.minLength(1))
});

const ProvinceSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	regions: v.pipe(v.array(RegionSchema), v.minLength(1))
});

/**
 * Validate and load a scenario.
 * Throws a descriptive error naming the offending field on invalid data.
 */
export function loadScenario(data: unknown): Province {
	const result = v.safeParse(ProvinceSchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid scenario data at '${path}': ${issue.message}`);
	}
	// Cross-field geometry rules the schema cannot express (change: add-city-view).
	for (const region of result.output.regions) {
		for (const settlement of region.settlements) {
			const start = settlementHouseholds(settlement);
			validateSettlementGeometry(settlement.geometry, start);
		}
	}
	return result.output;
}

/** The M1 scenario (loaded once at module init, fail-fast). */
export const province: Province = loadScenario(provinceJson);
