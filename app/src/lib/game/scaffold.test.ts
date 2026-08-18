/**
 * Smoke test for the app scaffold (change: add-app-scaffold).
 * Verifies Vitest runs core-style tests in the default `node` environment.
 */
import { describe, expect, it } from 'vitest';
import { GAME_TITLE } from './constants';

describe('app scaffold smoke', () => {
	it('exposes the game title constant', () => {
		expect(GAME_TITLE).toBe('Public Utility Manager');
	});
});
