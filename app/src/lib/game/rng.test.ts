import { describe, expect, it } from 'vitest';
import { createRng, drawFloat, drawInt } from './rng';

describe('mulberry32 rng', () => {
	it('identical seeds produce identical sequences', () => {
		const a = createRng(0x1890);
		const b = createRng(0x1890);
		const seqA = Array.from({ length: 10 }, () => drawFloat(a));
		const seqB = Array.from({ length: 10 }, () => drawFloat(b));
		expect(seqA).toEqual(seqB);
	});

	it('different seeds produce different sequences', () => {
		const a = createRng(1);
		const b = createRng(2);
		const seqA = Array.from({ length: 10 }, () => drawFloat(a));
		const seqB = Array.from({ length: 10 }, () => drawFloat(b));
		expect(seqA).not.toEqual(seqB);
	});

	it('draws stay in [0, 1)', () => {
		const rng = createRng(42);
		for (let i = 0; i < 1000; i++) {
			const v = drawFloat(rng);
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});

	it('drawInt respects bounds', () => {
		const rng = createRng(7);
		for (let i = 0; i < 1000; i++) {
			const v = drawInt(rng, 3, 9);
			expect(Number.isInteger(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(3);
			expect(v).toBeLessThan(9);
		}
	});
});
