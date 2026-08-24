<script lang="ts">
	/**
	 * Customer mix panel (change: add-power-origin-transparency): per
	 * settlement of the selected region, the household-weighted average
	 * electrification share and the per-wealth-segment shares in percent —
	 * a pure render-time derivation from the growth state.
	 */
	import type { GameState } from '$lib/game/types';
	import { province } from '$lib/game/scenario';

	let { game, regionId }: { game: GameState; regionId: string } = $props();

	const SEGMENTS = [
		{ key: 'wealthy', label: 'wohlhabend' },
		{ key: 'average', label: 'bürgerlich' },
		{ key: 'poor', label: 'arm' }
	] as const;

	const rows = $derived.by(() => {
		const region = province.regions.find((r) => r.id === regionId);
		if (!region) return [];
		const out: {
			settlementId: string;
			name: string;
			average: number;
			segments: { key: string; label: string; percent: number }[];
		}[] = [];
		for (const settlement of region.settlements) {
			const hh = game.systems.growth.households[settlement.id];
			const shares = game.systems.growth.shares[settlement.id];
			if (!hh || !shares) continue;
			let total = 0;
			let connected = 0;
			const segments: { key: string; label: string; percent: number }[] = [];
			for (const { key, label } of SEGMENTS) {
				const count = hh[key];
				const share = shares[key];
				total += count;
				connected += count * share;
				segments.push({ key, label, percent: Math.round(share * 100) });
			}
			out.push({
				settlementId: settlement.id,
				name: settlement.name,
				average: total > 0 ? connected / total : 0,
				segments
			});
		}
		return out;
	});

	/** German percent formatting: "54 %" with a narrow no-break space. */
	function pct(value: number): string {
		return `${Math.round(value * 100).toLocaleString('de-DE')}\u00A0%`;
	}
</script>

<section class="panel" data-testid="customer-mix-panel">
	<h3>Kundenquote</h3>
	{#if rows.length === 0}
		<p class="muted">Noch keine Daten.</p>
	{:else}
		{#each rows as row (row.settlementId)}
			<div class="settlement" data-testid="mix-{row.settlementId}">
				<div class="name">{row.name}</div>
				<div class="avg" data-testid="mix-avg-{row.settlementId}">Ø {pct(row.average)}</div>
				<div class="segments">
					{#each row.segments as seg (seg.key)}
						<span class="seg" data-testid="mix-{row.settlementId}-{seg.key}">
							{seg.label} {seg.percent.toLocaleString('de-DE')}&nbsp;%
						</span>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</section>

<style>
	.panel {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 10px 12px;
		background: #fff;
	}
	h3 { margin: 0 0 8px; font-size: 14px; }
	.muted { color: #94a3b8; font-size: 12px; }
	.settlement { border-top: 1px solid #f1f5f9; padding: 6px 0; }
	.settlement:first-of-type { border-top: none; }
	.name { font-weight: 600; font-size: 12px; }
	.avg { color: #0369a1; font-weight: 600; font-size: 12px; }
	.segments { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: #64748b; }
	.seg { white-space: nowrap; }
</style>
