/**
 * Unit tests for persistence (node project, injectable MemoryStorage — no DOM).
 * Spec: add-persistence — roundtrip fidelity, version guard, corrupt JSON,
 * in-memory storage, no-op fallback.
 */
import { describe, expect, it } from 'vitest';
import {
	clearSave,
	hasSave,
	loadGame,
	MemoryStorage,
	SAVE_KEY,
	SAVE_VERSION,
	saveGame
} from './persistence';
import { createInitialState, tick } from './sim';
import { createPlant } from './plant';
import type { GameState } from './types';

/** Mid-game state: plant built, two quarters settled (clock, ids, rng advanced). */
function midGameState(): GameState {
	const base = createInitialState();
	const plant = createPlant(base, 'region-coast', 'Kraftwerk Hafenstadt');
	plant.components.push(
		{ id: 100, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
		{ id: 101, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
	);
	plant.crew = 10;
	return tick(tick(base));
}

describe('persistence', () => {
	it('roundtrip: loaded state is deep-equal to the saved mid-game state', () => {
		const storage = new MemoryStorage();
		const state = midGameState();
		expect(saveGame(state, storage)).toBe(true);
		expect(hasSave(storage)).toBe(true);
		expect(loadGame(storage)).toEqual(state);
	});

	it('version guard: old save rejected with both versions named', () => {
		const storage = new MemoryStorage();
		storage.setItem(
			SAVE_KEY,
			JSON.stringify({ version: SAVE_VERSION - 1, state: createInitialState() })
		);
		expect(() => loadGame(storage)).toThrowError(
			/Save version mismatch: save is v0, build expects v1/
		);
	});

	it('corrupt JSON is rejected with a clear error', () => {
		const storage = new MemoryStorage();
		storage.setItem(SAVE_KEY, '{not valid json');
		expect(() => loadGame(storage)).toThrowError(/Corrupt save data/);
	});

	it('no save present: hasSave false, loadGame throws, clearSave safe', () => {
		const storage = new MemoryStorage();
		expect(hasSave(storage)).toBe(false);
		expect(() => loadGame(storage)).toThrowError(/No save present/);
		expect(() => clearSave(storage)).not.toThrow();
	});

	it('clear removes an existing save', () => {
		const storage = new MemoryStorage();
		saveGame(midGameState(), storage);
		clearSave(storage);
		expect(hasSave(storage)).toBe(false);
	});

	it('null storage (no DOM): save is a safe no-op returning false', () => {
		expect(saveGame(midGameState(), null)).toBe(false);
		expect(hasSave(null)).toBe(false);
		expect(() => clearSave(null)).not.toThrow();
	});
});
