/**
 * @vitest-environment happy-dom
 * UI tests for the game shell: tariff change, expansion order, year-close
 * modal, game-over overlay, tram decision (spec: add-game-ui).
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import GameShell from './GameShell.svelte';
import { createInitialState, tick } from '$lib/game/sim';
import { createPlant } from '$lib/game/plant';
import type { GameState } from '$lib/game/types';

/** Fast-forward a state to the start of a given year (settles prior quarters). */
function atYear(year: number, base: GameState = createInitialState()): GameState {
	let s = base;
	while (s.clock.year < year) s = tick(s);
	return s;
}

/** Build a state with an operational plant in the coast region. */
function withPlant(base: GameState = createInitialState()): GameState {
	const plant = createPlant(base, 'region-coast', 'Kraftwerk Hafenstadt');
	plant.components.push(
		{ id: 100, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
		{ id: 101, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
	);
	return base;
}

type ShellExposed = { step: () => void; snapshot: () => GameState };

describe('GameShell', () => {
	it('shows clock, cash and speed controls', () => {
		render(GameShell, { autoRun: false });
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
		expect(screen.getByTestId('cash').textContent).toContain('50.000');
		expect(screen.getByTestId('step-button')).toBeTruthy();
	});

	it('binds cash amount and $ with a non-breaking space', () => {
		render(GameShell, { autoRun: false });
		expect(screen.getByTestId('cash').textContent).toContain('50.000\u00A0$');
		expect(screen.getByTestId('cash').textContent).not.toContain(' $');
	});

	it('binds tariff value and $/kWh with a non-breaking space', () => {
		render(GameShell, { autoRun: false });
		expect(screen.getByTestId('tariff-value').textContent).toContain('0.30\u00A0$/kWh');
	});

	it('tariff change: slider to 0.40 updates state tariff', async () => {
		const rendered = render(GameShell, { autoRun: false });
		const exposed = rendered.component as unknown as ShellExposed;
		const slider = screen.getByTestId('tariff-slider') as HTMLInputElement;
		await fireEvent.input(slider, { target: { value: '0.4' } });
		await fireEvent.change(slider);
		expect(exposed.snapshot().systems.economy.tariff).toBe(0.4);
		expect((screen.getByTestId('tariff-value') as HTMLElement).textContent).toContain('0.40');
	});

	it('expansion click: order generator adds it to the queue', async () => {
		const initial = withPlant();
		render(GameShell, { initialState: initial, autoRun: false });
		const order = await screen.findByTestId('order-generator-1');
		await fireEvent.click(order);
		expect(screen.queryByTestId('order-feedback')).toBeFalsy(); // no error shown
		// the queue lists the new component with its remaining build time
		expect(screen.getByText(/Bau-Queue/)).toBeTruthy();
		expect(screen.getByText(/noch 1 Quartal/)).toBeTruthy();
	});

	it('year close: badge appears, no modal, no blocking overlay (spec: tune-newspaper-presentation)', async () => {
		// state after 1890 Q4 was settled: one newspaper exists, unseen
		const state = atYear(1891);
		render(GameShell, { initialState: state, autoRun: false });
		expect(screen.queryByTestId('year-close')).toBeFalsy();
		expect(screen.queryByTestId('newspaper-modal')).toBeFalsy();
		const notice = screen.getByTestId('newspaper-notice');
		expect(notice.textContent).toContain('1890');
		await fireEvent.click(notice);
		expect(screen.getByTestId('newspaper-modal')).toBeTruthy();
	});

	it('history list re-opens a past newspaper', async () => {
		const state = atYear(1891);
		render(GameShell, { initialState: state, autoRun: false });
		await fireEvent.click(screen.getByTestId('newspaper-notice'));
		await fireEvent.click(screen.getByTestId('newspaper-dismiss'));
		await fireEvent.click(screen.getByTestId('history-paper-1890'));
		expect(screen.getByTestId('newspaper-modal')).toBeTruthy();
		expect(screen.getByText(/Westmark-Kurier/)).toBeTruthy();
	});

	it('year close without content: no notice, no history entry (spec: tune-newspaper-presentation)', () => {
		// Fast-forward past a year that produced a paper, then remove all
		// newspapers/messages to simulate a content-less save: no notice badge.
		const state = atYear(1891);
		state.systems.events.newspapers = [];
		render(GameShell, { initialState: state, autoRun: false });
		expect(screen.queryByTestId('newspaper-notice')).toBeFalsy();
		expect(screen.getByText(/Noch keine Zeitung erschienen/)).toBeTruthy();
	});

	it('game over overlay blocks play and offers restart', async () => {
		// Balance no longer drives a small staffed plant into bankruptcy within
		// a few quarters (see QUARTER_DAYS fix) — force the terminal state to
		// test the overlay/interaction itself.
		const state = withPlant();
		state.gameOver = true;
		render(GameShell, { initialState: state, autoRun: false });
		expect(screen.getByTestId('gameover-overlay')).toBeTruthy();
		const stepButton = screen.getByTestId('step-button') as HTMLButtonElement;
		expect(stepButton.disabled).toBeTruthy();
		await fireEvent.click(screen.getByTestId('restart'));
		expect(screen.getByTestId('clock').textContent).toBe('1890 — Q1');
	});

	it('plant panel offers no staffing controls (spec: remove-employee-management)', () => {
		const initial = withPlant();
		render(GameShell, { initialState: initial, autoRun: false });
		expect(screen.queryByTestId('crew-input-1')).toBeFalsy();
		expect(screen.queryByText('Besatzung')).toBeFalsy();
		// capacity shows as installed capacity (50 kW from one dynamo)
		expect(screen.getByText(/50 kW installiert/)).toBeTruthy();
	});

	it('tram offer appears in year 2 and is decidable', async () => {
		const state = atYear(1891);
		render(GameShell, { initialState: state, autoRun: false });
		expect(screen.getByTestId('tram-offer')).toBeTruthy();
		await fireEvent.click(screen.getByTestId('tram-accept'));
		expect(screen.queryByTestId('tram-offer')).toBeFalsy();
		expect(screen.getByText(/Aktiv seit 1891/)).toBeTruthy();
	});
});
