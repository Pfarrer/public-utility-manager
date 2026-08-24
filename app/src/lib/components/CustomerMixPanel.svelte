<script lang="ts">
	/**
	 * Customer mix panel (change: add-power-origin-transparency): per
	 * settlement of the selected region, the household-weighted average
	 * electrification share and the per-wealth-segment shares in percent,
	 * split by current type ⎓/~ (change: add-three-phase-power) —
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
			segments: { key: string; label: string; percent: number; dcPercent: number; acPercent: number }[];
			acAny: boolean;
		}[] = [];
		for (const settlement of region.settlements) {
			const hh = game.systems.growth.households[settlement.id];
			const shares = game.systems.growth.shares[settlement.id];
			if (!hh || !shares) continue;
			let total = 0;
			let connected = 0;
			let acAny = false;
			const segments: {
				key: string;
				label: string;
				percent: number;
				dcPercent: number;
				acPercent: number;
			}[] = [];
			for (const { key, label } of SEGMENTS) {
				const count = hh[key];
				const share = shares[key];
				total += count;
				connected += count * (share.dc + share.ac);
				if (share.ac > 0) acAny = true;
				segments.push({
					key,
					label,
					percent: Math.round((share.dc + share.ac) * 100),
					dcPercent: Math.round(share.dc * 100),
					acPercent: Math.round(share.ac * 100)
				});
			}
			out.push({
				settlementId: settlement.id,
				name: settlement.name,
				average: total > 0 ? connected / total : 0,
				segments,
				acAny
			});
		}
		return out;
	});

	/** True when the region has operational AC capacity (for the no-customers hint). */
	const acCapacity = $derived((game.systems.dispatch.current[regionId]?.acCapacityKw ?? 0) > 0);

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
							{#if seg.acPercent > 0}
								<span class="split" data-testid="mix-split-{row.settlementId}-{seg.key}">
									(⎓&nbsp;{seg.dcPercent.toLocaleString('de-DE')}&nbsp;% ·
									~&nbsp;{seg.acPercent.toLocaleString('de-DE')}&nbsp;%)
								</span>
							{/if}
						</span>
					{/each}
				</div>
				{#if acCapacity && !row.acAny}
					<p class="hint" data-testid="mix-ac-hint-{row.settlementId}">
						Drehstrom: noch keine Kunden — Tarif senken oder abwarten.
					</p>
				{/if}
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
	.split { color: #0369a1; }
	.hint { color: #b45309; font-size: 11px; margin: 4px 0 0; }
</style>
