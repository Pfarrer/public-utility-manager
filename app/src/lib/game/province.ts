/** Province world model — regions, settlements, wealth segments (change: add-province-model). */

/** Wealth categories fixed to 3 per vision. */
export type WealthCategory = 'wealthy' | 'average' | 'poor';
export const WEALTH_CATEGORIES: readonly WealthCategory[] = ['wealthy', 'average', 'poor'];

export type SettlementType = 'city' | 'village';

/** Households per wealth category. */
export type WealthSegments = Record<WealthCategory, number>;

export interface Settlement {
	id: string;
	name: string;
	type: SettlementType;
	/** Flavor stat (circle size on the map); households drive demand. */
	population: number;
	/** Household counts per wealth category. */
	households: WealthSegments;
}

/** Terrain-flavoured regions of the province. */
export type TerrainType = 'coast' | 'mountains' | 'highland' | 'farmland';

export interface Region {
	id: string;
	name: string;
	terrain: TerrainType;
	/** M1: exactly one region is playable. */
	unlocked: boolean;
	settlements: Settlement[];
}

export interface Province {
	name: string;
	regions: Region[];
}

/** Total population of a region (sum over settlements). */
export function regionPopulation(region: Region): number {
	return region.settlements.reduce((sum, s) => sum + s.population, 0);
}

/** Total households of a region, summed per wealth category. */
export function regionHouseholds(region: Region): WealthSegments {
	const totals: WealthSegments = { wealthy: 0, average: 0, poor: 0 };
	for (const s of region.settlements) {
		for (const cat of WEALTH_CATEGORIES) totals[cat] += s.households[cat];
	}
	return totals;
}

/** Total households of a settlement (all categories). */
export function settlementHouseholds(settlement: Settlement): number {
	return WEALTH_CATEGORIES.reduce((sum, cat) => sum + settlement.households[cat], 0);
}
