import { describe, expect, it } from 'vitest';
import { createInitialState, tick } from './sim';
import { nextId } from './types';

describe('sim tick', () => {
	it('advances one quarter per tick', () => {
		const state = createInitialState();
		expect(tick(state).clock).toEqual({ year: 1890, quarter: 2 });
		expect(state.clock).toEqual({ year: 1890, quarter: 1 }); // input untouched
	});

	it('replay: same initial state ticked 8 times twice is deep-equal', () => {
		const run = () => {
			let s = createInitialState(123);
			for (let i = 0; i < 8; i++) s = tick(s);
			return s;
		};
		expect(run()).toEqual(run());
	});

	it('ids survive save/load (JSON roundtrip) and stay counter-based', () => {
		let state = createInitialState();
		const firstId = nextId(state);
		const secondId = nextId(state);
		expect(firstId).toBe(1);
		expect(secondId).toBe(2);

		const loaded = JSON.parse(JSON.stringify(state)) as typeof state;
		expect(loaded.idCounter).toBe(state.idCounter);
		const thirdId = nextId(loaded);
		expect(thirdId).toBe(loaded.idCounter); // counter + 1 semantics: nextId increments first
		expect(thirdId).toBe(3);
	});

	it('state stays JSON-serializable (no undefined functions, no NaN)', () => {
		const state = tick(createInitialState());
		expect(() => JSON.parse(JSON.stringify(state))).not.toThrow();
	});
});
