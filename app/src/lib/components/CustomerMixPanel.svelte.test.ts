/**
 * @vitest-environment happy-dom
 * Component tests for the customer mix panel (change: add-power-origin-transparency,
 * split display: add-three-phase-power).
 */
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CustomerMixPanel from './CustomerMixPanel.svelte';
import { createInitialState } from '$lib/game/sim';
import type { GameState } from '$lib/game/types';

/** Build a shares map in the SegmentShare (dc/ac pair) format. */
function pairShares(dc: { wealthy: number; average: number; poor: number }): GameState['systems']['growth']['shares'][string] {
	return {
		wealthy: { dc: dc.wealthy, ac: 0 },
		average: { dc: dc.average, ac: 0 },
		poor: { dc: dc.poor, ac: 0 }
	};
}

describe('CustomerMixPanel', () => {
	it('renders a row per settlement of the region', () => {
		render(CustomerMixPanel, { game: createInitialState(), regionId: 'region-coast' });
		expect(screen.getByTestId('mix-city-hafenstadt')).toBeTruthy();
		expect(screen.getByTestId('mix-village-fischerdorf')).toBeTruthy();
	});

	it('shows the initial 5 % share for every segment', () => {
		render(CustomerMixPanel, { game: createInitialState(), regionId: 'region-coast' });
		const hafenstadt = screen.getByTestId('mix-city-hafenstadt-wealthy');
		expect(hafenstadt.textContent).toContain('5');
	});

	it('shows household-weighted average and per-segment percent from real shares', () => {
		const game = createInitialState();
		// wealthy 0.71 with 800 hh, average 0.40 with 300, poor 0.11 with 100
		// → weighted average (0.71·800 + 0.40·300 + 0.11·100) / 1200 = 699/1200 ≈ 58 %
		game.systems.growth.households['city-hafenstadt'] = { wealthy: 800, average: 300, poor: 100 };
		game.systems.growth.shares['city-hafenstadt'] = pairShares({ wealthy: 0.71, average: 0.4, poor: 0.11 });
		render(CustomerMixPanel, { game, regionId: 'region-coast' });
		expect(screen.getByTestId('mix-avg-city-hafenstadt').textContent).toContain('58');
		expect(screen.getByTestId('mix-city-hafenstadt-wealthy').textContent).toContain('71');
		expect(screen.getByTestId('mix-city-hafenstadt-average').textContent).toContain('40');
		expect(screen.getByTestId('mix-city-hafenstadt-poor').textContent).toContain('11');
	});

	it('rounds half away from zero for display', () => {
		const game = createInitialState();
		game.systems.growth.households['city-hafenstadt'] = { wealthy: 1, average: 1, poor: 1 };
		game.systems.growth.shares['city-hafenstadt'] = pairShares({ wealthy: 0.335, average: 0.5, poor: 0.625 });
		render(CustomerMixPanel, { game, regionId: 'region-coast' });
		// 0.335 → 34 (rounds down), 0.5 → 50, 0.625 → 63 (Math.round)
		expect(screen.getByTestId('mix-city-hafenstadt-wealthy').textContent).toContain('34');
		expect(screen.getByTestId('mix-city-hafenstadt-average').textContent).toContain('50');
		expect(screen.getByTestId('mix-city-hafenstadt-poor').textContent).toContain('63');
	});

	it('reflects new shares after a state update while mounted', () => {
		const game = createInitialState();
		const { rerender } = render(CustomerMixPanel, { game, regionId: 'region-coast' });
		expect(screen.getByTestId('mix-city-hafenstadt-wealthy').textContent).toContain('5');
		game.systems.growth.shares['city-hafenstadt'].wealthy = { dc: 0.5, ac: 0 };
		rerender({ game, regionId: 'region-coast' });
		expect(screen.getByTestId('mix-city-hafenstadt-wealthy').textContent).toContain('50');
	});

	it('shows the ⎓/~ split when AC customers exist (change: add-three-phase-power)', () => {
		const game = createInitialState();
		game.systems.growth.shares['city-hafenstadt'] = {
			wealthy: { dc: 0.4, ac: 0.31 },
			average: { dc: 0.5, ac: 0 },
			poor: { dc: 0.1, ac: 0 }
		};
		render(CustomerMixPanel, { game, regionId: 'region-coast' });
		// wealthy shows 71 % total with split (⎓ 40 % · ~ 31 %)
		expect(screen.getByTestId('mix-city-hafenstadt-wealthy').textContent).toContain('71');
		const split = screen.getByTestId('mix-split-city-hafenstadt-wealthy');
		expect(split.textContent).toContain('40');
		expect(split.textContent).toContain('31');
		// average has no AC → no split element
		expect(screen.queryByTestId('mix-split-city-hafenstadt-average')).toBeNull();
	});
});
