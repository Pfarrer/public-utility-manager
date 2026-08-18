/**
 * @vitest-environment happy-dom
 * Persistence UI tests (spec: add-persistence): autosave after Q4 click,
 * manual save/clear buttons, resume-on-load through AppRoot with the REAL
 * localStorage that happy-dom provides — critical paths as real clicks.
 */
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, beforeEach } from 'vitest';
import AppRoot from './AppRoot.svelte';
import GameShell from './GameShell.svelte';
import { clearSave, hasSave, loadGame, SAVE_KEY } from '$lib/game/persistence';
import { createInitialState } from '$lib/game/sim';

describe('persistence UI (real clicks, real localStorage)', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('clicking through Q4 autosaves — save clock reads next year Q1', async () => {
		render(GameShell, { autoRun: false });
		expect(hasSave()).toBe(false);
		for (let i = 0; i < 4; i++) {
			await fireEvent.click(screen.getByTestId('step-button'));
			await tick();
		}
		expect(hasSave()).toBe(true);
		expect(loadGame().clock.year).toBe(1891);
		expect(loadGame().clock.quarter).toBe(1);
	});

	it('manual save button writes a save at the current quarter', async () => {
		render(GameShell, { autoRun: false });
		await fireEvent.click(screen.getByTestId('step-button'));
		await tick();
		await fireEvent.click(screen.getByTestId('save-button'));
		expect(hasSave()).toBe(true);
		const s = loadGame();
		expect(s.clock.year).toBe(1890);
		expect(s.clock.quarter).toBe(2);
	});

	it('clear button removes the save', async () => {
		render(GameShell, { autoRun: false });
		await fireEvent.click(screen.getByTestId('save-button'));
		expect(hasSave()).toBe(true);
		await fireEvent.click(screen.getByTestId('clear-save-button'));
		expect(hasSave()).toBe(false);
	});

	it('AppRoot resumes from an existing save with a banner', async () => {
		// seed a save the way the game itself writes it (Q4 autosave shape)
		const base = createInitialState();
		base.clock = { year: 1892, quarter: 3 };
		localStorage.setItem(
			SAVE_KEY,
			JSON.stringify({ version: 1, state: base })
		);
		render(AppRoot);
		await tick();
		await tick();
		expect(screen.getByTestId('resume-banner')).toBeTruthy();
		expect(screen.getByTestId('clock').textContent).toBe('1892 — Q3');
	});

	it('AppRoot starts fresh when the save is corrupt', async () => {
		localStorage.setItem(SAVE_KEY, 'nope{{{');
		render(AppRoot);
		await tick();
		await tick();
		expect(screen.queryByTestId('resume-banner')).toBeFalsy();
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
		expect(hasSave()).toBe(false); // corrupt slot cleared
	});

	it('AppRoot starts fresh without any save', async () => {
		render(AppRoot);
		await tick();
		await tick();
		expect(screen.queryByTestId('resume-banner')).toBeFalsy();
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
	});
});
