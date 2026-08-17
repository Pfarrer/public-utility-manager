/** Framework-free simulation core — shared types (change: add-sim-core). */

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
/** Placeholder — filled by the add-demand-profiles change. */
export interface DemandState {}
/** Placeholder — filled by the add-supply-dispatch change. */
export interface DispatchState {}
/** Placeholder — filled by the add-regional-growth change. */
export interface GrowthState {}
/** Placeholder — filled by the add-economy change. */
export interface EconomyState {}

/** Assign the next entity id from the in-state counter. */
export function nextId(state: GameState): number {
	state.idCounter += 1;
	return state.idCounter;
}
