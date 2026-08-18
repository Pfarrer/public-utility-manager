import { describe, expect, it } from 'vitest';
import { advanceQuarter, QUARTERS_PER_YEAR } from './clock';
import type { GameClock } from './types';

describe('quarter clock', () => {
	it('four ticks make a year (1890 Q1 → 1891 Q1)', () => {
		let clock: GameClock = { year: 1890, quarter: 1 };
		for (let i = 0; i < QUARTERS_PER_YEAR; i++) {
			clock = advanceQuarter(clock);
		}
		expect(clock).toEqual({ year: 1891, quarter: 1 });
	});

	it('Q4 rolls over to next year Q1', () => {
		expect(advanceQuarter({ year: 1892, quarter: 4 })).toEqual({ year: 1893, quarter: 1 });
	});

	it('quarters within a year increment in place', () => {
		expect(advanceQuarter({ year: 1892, quarter: 2 })).toEqual({ year: 1892, quarter: 3 });
	});
});
