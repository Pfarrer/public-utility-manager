/**
 * @vitest-environment happy-dom
 * Critical-path tests: drive the UI through REAL DOM interactions (button
 * clicks, not exported functions), because exported helpers bypass the
 * reactive proxy wiring that produced the DataCloneError. Every test here
 * must fail if a user-visible interaction breaks.
 *
 * Regression covered (commit 9e8a36b): clicking "Quartal abschließen" on a
 * mounted shell crashed with DataCloneError — only a real click through the
 * proxy-held state reproduces it.
 */
import { render, screen, fireEvent } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import GameShell from './GameShell.svelte';

describe('GameShell critical paths (real clicks)', () => {
	it('clicking "Quartal abschließen" advances the clock (no DataCloneError)', async () => {
		render(GameShell, { autoRun: false });
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
		await fireEvent.click(screen.getByTestId('step-button'));
		await tick();
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q2');
	});

	it('clicking through a full year shows the newspaper badge, not a modal (spec: tune-newspaper-presentation)', async () => {
		render(GameShell, { autoRun: false });
		for (let i = 0; i < 4; i++) {
			await fireEvent.click(screen.getByTestId('step-button'));
			await tick();
		}
		// no blocking overlay, no auto-opened modal — just the notice badge
		expect(screen.queryByTestId('year-close')).toBeFalsy();
		expect(screen.queryByTestId('newspaper-modal')).toBeFalsy();
		const notice = screen.getByTestId('newspaper-notice');
		expect(notice.textContent).toContain('1890');
		await fireEvent.click(notice);
		await tick();
		expect(screen.getByTestId('newspaper-modal')).toBeTruthy();
	});

	it('newspaper dismiss returns to the game and hides the badge', async () => {
		render(GameShell, { autoRun: false });
		for (let i = 0; i < 4; i++) {
			await fireEvent.click(screen.getByTestId('step-button'));
			await tick();
		}
		await fireEvent.click(screen.getByTestId('newspaper-notice'));
		await tick();
		await fireEvent.click(screen.getByTestId('newspaper-dismiss'));
		await tick();
		expect(screen.queryByTestId('newspaper-modal')).toBeFalsy();
		expect(screen.queryByTestId('newspaper-notice')).toBeFalsy();
	});
});
