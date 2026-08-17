/** Simulation entry point — deterministic quarter tick (change: add-sim-core). */

import { advanceQuarter } from './clock';
import { runDemand, runDispatch } from './dispatch';
import { economy as economyData, runEconomy } from './economy';
import { crisisFactor, initEvents, runEvents } from './events';
import { initGrowth, runGrowth, yearlyGrowth } from './growth';
import { advanceConstruction } from './plant';
import type { GameState } from './types';

/** Create the initial state for a new game (year 1890, quarter 1, M1 defaults). */
export function createInitialState(seed = 0x1890): GameState {
	return {
		clock: { year: 1890, quarter: 1 },
		cash: 0,
		seed,
		rngState: seed >>> 0,
		idCounter: 0,
		gameOver: false,
		systems: {
			construction: { plants: [], completed: [] },
			demand: { current: {} },
			dispatch: { current: {}, history: [], satisfaction: {} },
			growth: initGrowth(),
			economy: {
				tariff: economyData.tariffDefault,
				transactions: [],
				annualReports: [],
				negativeCashQuarters: 0
			},
			events: initEvents()
		}
	};
}

/** Ordered system pipeline — each change hooks its system in here. */
function runSystems(state: GameState, settled: { year: number; quarter: number }): void {
	// construction → demand → dispatch → growth → economy → events
	advanceConstruction(state);
	runDemand(state);
	runDispatch(state);
	runGrowth(state);
	runEconomy(state, { crisisFactor: crisisFactor(settled.year) });
	runEvents(state, settled);
}

/**
 * Advance the simulation one quarter.
 *
 * Deep-clones the state, mutates the clone, returns it — the deterministic
 * replay story for M1: same input state + same actions ⇒ same output state.
 */
export function tick(state: GameState): GameState {
	const next = structuredClone(state);
	// Write the RNG cursor back into the cloned state, exactly as consumed.
	const settled = { ...next.clock };
	next.clock = advanceQuarter(next.clock);
	runSystems(next, settled);
	// Year boundary: the settled quarter was Q4 → settlements grow & drift.
	if (settled.quarter === 4) yearlyGrowth(next);
	return next;
}
