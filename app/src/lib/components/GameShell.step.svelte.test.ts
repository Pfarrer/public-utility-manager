/**
 * @vitest-environment happy-dom
 * Regression: the game state is held in a deep reactive $state proxy, but
 * tick() clones via structuredClone, which cannot serialize proxies
 * (DataCloneError: Failed to execute 'structuredClone' on 'Window').
 * step() must detach a plain snapshot at the boundary before ticking.
 */
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import GameShell from './GameShell.svelte';
import type { GameState } from '$lib/game/types';

type ShellExposed = { step: () => void; snapshot: () => GameState };

describe('GameShell quarter advance', () => {
	it('advances a quarter from a mounted component without DataCloneError', async () => {
		const rendered = render(GameShell, { autoRun: false });
		const exposed = rendered.component as unknown as ShellExposed;
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
		expect(() => exposed.step()).not.toThrow();
		expect(exposed.snapshot().clock.quarter).toBe(2);
		await tick(); // Svelte 5 batches effect flushes into a microtask
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q2');
	});

	it('survives repeated steps through the reactive proxy (full year)', () => {
		const rendered = render(GameShell, { autoRun: false });
		const exposed = rendered.component as unknown as ShellExposed;
		for (let i = 0; i < 4; i++) exposed.step();
		expect(exposed.snapshot().clock.year).toBe(1891);
		expect(exposed.snapshot().systems.events.newspapers.length).toBe(1);
	});
});
