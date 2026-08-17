/** Simulation entry point — deterministic quarter tick (change: add-sim-core). */

import { advanceQuarter } from './clock';
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
			construction: {},
			demand: {},
			dispatch: {},
			growth: {},
			economy: {}
		}
	};
}

/** Ordered system pipeline — no-op placeholders until their changes land. */
function runSystems(_state: GameState): void {
	// construction → demand → dispatch → growth → economy
	// Each system is added by its own change and mutates the cloned state.
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
	next.clock = advanceQuarter(next.clock);
	runSystems(next);
	return next;
}
