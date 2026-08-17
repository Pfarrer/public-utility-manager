/** Quarter clock — 1 tick = 1 quarter, 4 quarters per year (change: add-sim-core). */

import type { GameClock } from './types';

export const QUARTERS_PER_YEAR = 4;

/** Advance one quarter; Q4 rolls over into Q1 of the next year. */
export function advanceQuarter(clock: GameClock): GameClock {
	return clock.quarter === QUARTERS_PER_YEAR
		? { year: clock.year + 1, quarter: 1 }
		: { year: clock.year, quarter: (clock.quarter + 1) as 2 | 3 | 4 };
}
