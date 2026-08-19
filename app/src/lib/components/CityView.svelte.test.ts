/**
 * @vitest-environment happy-dom
 * Component tests for the city view (change: add-city-view).
 */
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CityView from './CityView.svelte';
import { createInitialState } from '$lib/game/sim';
import { createPlant } from '$lib/game/plant';
import type { GameState } from '$lib/game/types';

/** Build a state with an operational plant in the coast region. */
function withPlant(base: GameState = createInitialState()): GameState {
	const plant = createPlant(base, 'region-coast', 'Kraftwerk Hafenstadt');
	plant.components.push(
		{ id: 100, componentId: 'steam-engine-1890', status: 'operational', remaining: 0, cost: 8000 },
		{ id: 101, componentId: 'generator-50kw', status: 'operational', remaining: 0, cost: 5000 }
	);
	return base;
}

describe('CityView', () => {
	it('renders a polygon node per settlement with a name label', () => {
		render(CityView, { game: createInitialState(), regionId: 'region-coast' });
		expect(screen.getByTestId('city-settlement-city-hafenstadt')).toBeTruthy();
		expect(screen.getByTestId('city-settlement-village-fischerdorf')).toBeTruthy();
		expect(screen.getByText('Hafenstadt')).toBeTruthy();
		expect(screen.getByText('Fischerdorf')).toBeTruthy();
	});

	it('shows no illumination element when no plant is operational', () => {
		const { container } = render(CityView, {
			game: createInitialState(),
			regionId: 'region-coast'
		});
		expect(container.querySelector('.illumination')).toBeNull();
	});

	it('illuminates a settlement when a plant is operational (share > 0)', () => {
		const game = withPlant();
		const { container } = render(CityView, { game, regionId: 'region-coast' });
		const hafenstadt = screen.getByTestId('city-settlement-city-hafenstadt');
		// initial share 0.05 → glow > 0 because a plant runs
		const glow = Number(hafenstadt.getAttribute('data-glow'));
		expect(glow).toBeGreaterThan(0);
		// plant icon rendered operational
		const plantIcon = screen.getByTestId('city-plant-1');
		expect(plantIcon.getAttribute('class')).toContain('running');
	});

	it('renders scaffolding state for plants under construction', () => {
		const game = createInitialState();
		const plant = createPlant(game, 'region-coast', 'Kraftwerk im Bau');
		plant.components.push({
			id: 100,
			componentId: 'steam-engine-1890',
			status: 'under_construction',
			remaining: 2,
			cost: 8000
		});
		const { container } = render(CityView, { game, regionId: 'region-coast' });
		const plantIcon = screen.getByTestId('city-plant-1');
		expect(plantIcon.getAttribute('class')).toContain('building');
		expect(container.querySelector('.illumination')).toBeNull();
	});

	it('carries the blackout class when the quarter reports a blackout', () => {
		const game = withPlant();
		// region-coast has no dispatch entry yet; fabricate one with blackout
		game.systems.dispatch.current['region-coast'] = {
			regionId: 'region-coast',
			year: 1890,
			quarter: 1,
			capacityKw: 0,
			peakKw: 100,
			servedKwh: 0,
			unservedKwh: 100 * 24 * 91,
			outageHours: 24,
			blackout: true,
			priorityServedKwh: 0
		};
		render(CityView, { game, regionId: 'region-coast' });
		const hafenstadt = screen.getByTestId('city-settlement-city-hafenstadt');
		expect(hafenstadt.getAttribute('class')).toContain('blackout');
		expect(screen.getByTestId('blackout-note')).toBeTruthy();
	});

	it('advances the polygon stage when households cross a threshold', () => {
		const game = createInitialState();
		const before = screen2stage(game);
		// grow Hafenstadt past the stage-2 threshold (5700)
		const hh = game.systems.growth.households['city-hafenstadt'];
		hh.poor += 600;
		const after = screen2stage(game);
		expect(after).toBeGreaterThan(before);
	});

	it('renders a flow line only from an operational plant', () => {
		const game = withPlant();
		const { container } = render(CityView, { game, regionId: 'region-coast' });
		expect(container.querySelector('.flow')).toBeTruthy();

		const game2 = createInitialState();
		const plant = createPlant(game2, 'region-coast', 'Kraftwerk im Bau');
		plant.components.push({
			id: 100,
			componentId: 'steam-engine-1890',
			status: 'under_construction',
			remaining: 2,
			cost: 8000
		});
		const { container: c2 } = render(CityView, { game: game2, regionId: 'region-coast' });
		expect(c2.querySelector('.flow')).toBeNull();
	});
});

/** Helper: render, read stage index of Hafenstadt, unmount. */
function screen2stage(game: GameState): number {
	const { unmount } = render(CityView, { game, regionId: 'region-coast' });
	const node = screen.getByTestId('city-settlement-city-hafenstadt');
	const stage = Number(node.getAttribute('data-stage-index'));
	unmount();
	return stage;
}
