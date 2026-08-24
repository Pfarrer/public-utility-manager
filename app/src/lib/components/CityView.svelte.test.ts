/**
 * @vitest-environment happy-dom
 * Component tests for the city view (change: add-city-view).
 */
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CityView from './CityView.svelte';
import { createInitialState } from '$lib/game/sim';
import { createPlant } from '$lib/game/plant';
import { ringCentroid } from '$lib/game/geometry';
import provinceM1 from '$lib/data/province-m1.json';
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
			dcCapacityKw: 0,
			acCapacityKw: 0,
			peakKw: 100,
			dcPeakKw: 100,
			acPeakKw: 0,
			dcServedKwh: 0,
			acServedKwh: 0,
			dcUnservedKwh: 100 * 24 * 91,
			acUnservedKwh: 0,
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

	it('lights the village from the regional grid without its own plant', () => {
		// The plant is hash-assigned to ONE settlement; the other must still
		// light up (region grid) and get a distribution line (spec: village
		// lights from the regional grid).
		const game = withPlant();
		const { container } = render(CityView, { game, regionId: 'region-coast' });
		const city = screen.getByTestId('city-settlement-city-hafenstadt');
		const village = screen.getByTestId('city-settlement-village-fischerdorf');
		// initial share 0.05 → glow > 0 for BOTH settlements
		expect(Number(city.getAttribute('data-glow'))).toBeGreaterThan(0);
		expect(Number(village.getAttribute('data-glow'))).toBeGreaterThan(0);
		// distribution line reaches the village
		expect(container.querySelector('[data-testid="grid-flow-village-fischerdorf"]')).toBeTruthy();
		expect(container.querySelector('[data-testid="grid-flow-city-hafenstadt"]')).toBeTruthy();
	});

	it('keeps every polygon grey while no plant in the region runs', () => {
		const game = createInitialState(); // no plants at all
		const { container } = render(CityView, { game, regionId: 'region-coast' });
		expect(container.querySelector('.illumination')).toBeNull();
		expect(container.querySelector('.flow')).toBeNull();
	});

	it('centres the glow on the settlement centroid, not the plant anchor', () => {
		const game = withPlant();
		render(CityView, { game, regionId: 'region-coast' });
		const settle = screen.getByTestId('city-settlement-city-hafenstadt');
		const glowCircle = settle.querySelector('.illumination circle');
		expect(glowCircle).toBeTruthy();
		// expected centroid from the live scenario geometry
		const hafenstadt = provinceM1.regions[0].settlements.find(
			(s) => s.id === 'city-hafenstadt'
		);
		const ring = hafenstadt?.geometry.stages[0].ring ?? '';
		const centroid = ringCentroid(ring);
		expect(Number(glowCircle?.getAttribute('cx'))).toBeCloseTo(centroid.x, 3);
		expect(Number(glowCircle?.getAttribute('cy'))).toBeCloseTo(centroid.y, 3);
	});

	it('shows Eigenversorgung for a settlement whose own plant runs', () => {
		const game = withPlant();
		render(CityView, { game, regionId: 'region-coast' });
		const origin = screen.getByTestId('origin-city-hafenstadt');
		expect(origin.textContent).toContain('Eigenversorgung');
	});

	it('names the feeding plant for a grid-fed settlement', () => {
		const game = withPlant();
		render(CityView, { game, regionId: 'region-coast' });
		// Fischerdorf has no plant of its own; the region grid lights it and
		// the origin line names the plant (spec: fed village names the plant).
		const origin = screen.getByTestId('origin-village-fischerdorf');
		expect(origin.textContent).toContain('Strom aus:');
		expect(origin.textContent).toContain('Kraftwerk Hafenstadt');
	});

	it('renders no origin line for dark settlements', () => {
		// no plant anywhere → everything dark, no origin line at all
		render(CityView, { game: createInitialState(), regionId: 'region-coast' });
		expect(screen.queryByTestId('origin-city-hafenstadt')).toBeNull();
		expect(screen.queryByTestId('origin-village-fischerdorf')).toBeNull();
	});

	it('carries the DC badge on every rendered plant icon', () => {
		const game = withPlant();
		render(CityView, { game, regionId: 'region-coast' });
		expect(screen.getByTestId('plant-current-1').textContent).toContain('⎓');
	});

	it('renders the badge also for plants under construction', () => {
		const game = createInitialState();
		const plant = createPlant(game, 'region-coast', 'Kraftwerk im Bau');
		plant.components.push({
			id: 100,
			componentId: 'steam-engine-1890',
			status: 'under_construction',
			remaining: 2,
			cost: 8000
		});
		render(CityView, { game, regionId: 'region-coast' });
		expect(screen.getByTestId('plant-current-1').textContent).toContain('⎓');
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
