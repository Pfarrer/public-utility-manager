<script lang="ts">
	/** Region detail: households per segment, electrification, satisfaction, peak vs capacity. */
	import type { GameState } from '$lib/game/types';
	import { province } from '$lib/game/scenario';

	let { game, regionId }: { game: GameState; regionId: string } = $props();

	const region = $derived(province.regions.find((r) => r.id === regionId));
	const dispatch = $derived(game.systems.dispatch.current[regionId]);
	const satisfaction = $derived(game.systems.dispatch.satisfaction[regionId] ?? 50);

	/** Region-aggregated households (living copy from growth) per wealth segment. */
	const households = $derived.by(() => {
		if (!region) return { wealthy: 0, average: 0, poor: 0 };
		const sums = { wealthy: 0, average: 0, poor: 0 };
		for (const s of region.settlements) {
			const hh = game.systems.growth.households[s.id];
			if (!hh) continue;
			sums.wealthy += hh.wealthy;
			sums.average += hh.average;
			sums.poor += hh.poor;
		}
		return sums;
	});

	/** Electrification share: connected households / total households. */
	const electrification = $derived.by(() => {
		if (!region) return 0;
		let total = 0;
		let connected = 0;
		for (const s of region.settlements) {
			const hh = game.systems.growth.households[s.id];
			const shares = game.systems.growth.shares[s.id];
			if (!hh || !shares) continue;
			for (const cat of ['wealthy', 'average', 'poor'] as const) {
				total += hh[cat];
				connected += hh[cat] * shares[cat];
			}
		}
		return total > 0 ? connected / total : 0;
	});
</script>

{#if region}
	<section class="panel" data-testid="region-detail">
		<h3>{region.name}</h3>
		<dl>
			<div><dt>Haushalte (reich/bürgerlich/arm)</dt><dd>{households.wealthy} / {households.average} / {households.poor}</dd></div>
			<div><dt>Elektrifizierung</dt><dd>{(electrification * 100).toFixed(1)} %</dd></div>
			<div><dt>Zufriedenheit</dt><dd>{satisfaction.toFixed(0)} / 100</dd></div>
			<div><dt>Spitzenlast vs. Kapazität</dt>
				<dd>{(dispatch?.peakKw ?? 0).toFixed(0)} / {(dispatch?.capacityKw ?? 0).toFixed(0)} kW</dd></div>
			<div><dt>Deckungsgrad</dt>
				<dd>{dispatch && dispatch.peakKw > 0 ? ((dispatch.servedKwh / (dispatch.peakKw * 24 * 91)).toFixed(2)) : '–'} </dd></div>
		</dl>
	</section>
{/if}

<style>
	.panel {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 10px 12px;
		background: #fff;
	}
	h3 { margin: 0 0 8px; font-size: 14px; }
	dl { display: grid; gap: 4px; margin: 0; }
	dl div { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; }
	dt { color: #64748b; }
	dd { margin: 0; font-weight: 600; }
</style>
