/** Framework-free simulation core — shared types (change: add-sim-core). */

import type { WealthCategory, WealthSegments } from './province';

/** One tick = one quarter; 4 quarters per year. */
export interface GameClock {
	year: number;
	quarter: 1 | 2 | 3 | 4;
}

/**
 * Central, save-serializable game state.
 *
 * Rules (spec: sim-core):
 * - Entity ids are assigned from the in-state counter (`nextId`), never from
 *   module-level counters, so save/load and replay keep ids stable.
 * - All randomness flows through the in-state RNG cursor (`rngState`) so the
 *   same initial state plus the same player actions replay identically.
 */
export interface GameState {
	/** Simulation clock; starts at the scenario start year, quarter 1. */
	clock: GameClock;
	/** Company cash in EUR, rounded to cents (see `moneyRound`). */
	cash: number;
	/** Immutable 32-bit game seed (fixed at game start, e.g. for re-rolls). */
	seed: number;
	/** Evolving 32-bit RNG cursor (mulberry32 state, written back each tick). */
	rngState: number;
	/** Last assigned entity id; the next assigned id equals `idCounter + 1`. */
	idCounter: number;
	/** True once a lose condition (e.g. bankruptcy) has fired. */
	gameOver: boolean;
	/** Ordered system slots — no-op placeholders until their changes land. */
	systems: {
		construction: ConstructionState;
		demand: DemandState;
		dispatch: DispatchState;
		growth: GrowthState;
		economy: EconomyState;
	};
}

/** Placeholder — filled by the add-power-plant change. */
export interface ConstructionState {}
/** Per-region demand curves of the current quarter, kWh-sampled hourly in kW. */
export interface DemandState {
	current: Record<string, number[]>;
}

/** One region's dispatch result for a quarter. */
export interface QuarterDispatch {
	regionId: string;
	year: number;
	quarter: number;
	/** Available generation (kW) — installed × staffing across the region's plants. */
	capacityKw: number;
	/** Demand maximum of the representative day (kW). */
	peakKw: number;
	servedKwh: number;
	unservedKwh: number;
	/** Hours of the representative day with any deficit. */
	outageHours: number;
	blackout: boolean;
}

export interface DispatchState {
	/** Most recent quarter's result per region id. */
	current: Record<string, QuarterDispatch>;
	/** All past quarters (append-only), oldest first. */
	history: QuarterDispatch[];
	/** Customer satisfaction 0–100 per region id. */
	satisfaction: Record<string, number>;
}
// ---------------------------------------------------------------------------
// Growth (change: add-regional-growth)
// ---------------------------------------------------------------------------

/** Living households + electrification shares, owned by the growth system. */
export interface GrowthState {
	/** Household counts per settlement id — starts as a copy of the scenario, mutated by yearly growth. */
	households: Record<string, WealthSegments>;
	/** Electrification share per settlement id × wealth category, within [0, 1]. */
	shares: Record<string, Record<WealthCategory, number>>;
}

// ---------------------------------------------------------------------------
// Economy (change: add-economy)
// ---------------------------------------------------------------------------

export type TransactionKind = 'revenue' | 'fuel' | 'wages' | 'construction';

export interface Transaction {
	year: number;
	quarter: number;
	kind: TransactionKind;
	/** Signed amount in EUR: revenue positive, costs negative. */
	amount: number;
}

export interface AnnualReport {
	year: number;
	/** Signed sum per transaction kind (all kinds present, 0 if unused). */
	totals: Record<TransactionKind, number>;
	/** Sum of all transactions of the year — profit (positive) / loss (negative). */
	net: number;
}

export interface EconomyState {
	/** Player tariff in €/kWh (set via `setTariff`, clamped to data bounds). */
	tariff: number;
	/** Append-only ledger of all booked transactions. */
	transactions: Transaction[];
	/** One report per closed year, appended after the Q4 settlement. */
	annualReports: AnnualReport[];
	/** Consecutive quarters with cash < 0; game over at `bankruptcyQuarters`. */
	negativeCashQuarters: number;
}

// ---------------------------------------------------------------------------
// Power plant entities (change: add-power-plant)
// ---------------------------------------------------------------------------

export type ComponentStatus = 'under_construction' | 'operational';

export interface PlantComponent {
	id: number;
	/** Catalog id of the component spec. */
	componentId: string;
	status: ComponentStatus;
	/** Quarters until operational (counts down each tick). */
	remaining: number;
	/** Reference cost booked on completion. */
	cost: number;
}

export interface Plant {
	id: number;
	name: string;
	regionId: string;
	/** Player-set crew (clamped to required crew). */
	crew: number;
	components: PlantComponent[];
}

/** Journal entry for a completed construction order. */
export interface CompletionRecord {
	plantId: number;
	componentId: string;
	cost: number;
	year: number;
	quarter: number;
}

export interface ConstructionState {
	plants: Plant[];
	/** Deliveries of the current tick (cleared before each construction run). */
	completed: CompletionRecord[];
}

/** Assign the next entity id from the in-state counter. */
export function nextId(state: GameState): number {
	state.idCounter += 1;
	return state.idCounter;
}
