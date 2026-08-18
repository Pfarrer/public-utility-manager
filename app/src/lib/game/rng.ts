/** Seeded RNG — mulberry32, pure functions over an explicit state object (change: add-sim-core). */

/**
 * Explicit mulberry32 state so draws are pure with respect to this object and
 * the cursor can be persisted in (and restored from) `GameState.rngState`.
 */
export interface RngState {
	/** Internal mulberry32 accumulator (any int32 value; persisted as uint32). */
	a: number;
}

/** Create a generator state from a 32-bit seed (identical seeds ⇒ identical sequences). */
export function createRng(seed: number): RngState {
	return { a: seed >>> 0 };
}

/** Draw a uniform float in [0, 1). */
export function drawFloat(rng: RngState): number {
	rng.a = (rng.a + 0x6d2b79f5) | 0;
	let t = Math.imul(rng.a ^ (rng.a >>> 15), 1 | rng.a);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Draw an integer in [minInclusive, maxExclusive). */
export function drawInt(rng: RngState, minInclusive: number, maxExclusive: number): number {
	return minInclusive + Math.floor(drawFloat(rng) * (maxExclusive - minInclusive));
}
