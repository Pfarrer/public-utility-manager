/** Scenario loading — valibot-validated, fail-fast (change: add-province-model). */

import * as v from 'valibot';
import type { Province } from './province';

/** Schema mirrors the `Province` type; load-time validation, fail-fast. */
const WealthSegmentsSchema = v.object({
	wealthy: v.pipe(v.number(), v.integer(), v.minValue(0)),
	average: v.pipe(v.number(), v.integer(), v.minValue(0)),
	poor: v.pipe(v.number(), v.integer(), v.minValue(0))
});

const SettlementSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1)),
	name: v.pipe(v.string(), v.minLength(1)),
	type: v.picklist(['city', 'village']),
	population: v.pipe(v.number(), v.integer(), v.minValue(0)),
	households: WealthSegmentsSchema
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
	return result.output;
}
