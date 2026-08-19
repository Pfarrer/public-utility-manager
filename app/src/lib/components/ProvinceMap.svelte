<script lang="ts">
	/**
	 * Compact region selector (change: add-city-view): four region buttons,
	 * playable region highlighted, locked regions greyed with an unlock hint.
	 * Settlements are the city view's concern — no circles here.
	 */
	import { province } from '$lib/game/scenario';

	let {
		selected = 'region-coast',
		onselect = () => {}
	}: {
		selected?: string;
		onselect?: (regionId: string) => void;
	} = $props();

	const hovered = $state({ region: '' });
</script>

<div class="selector" data-testid="province-map">
	{#each province.regions as region (region.id)}
		{@const locked = !region.unlocked}
		<button
			class="region"
			class:locked
			class:selected={selected === region.id}
			aria-disabled={locked}
			onclick={() => !locked && onselect(region.id)}
			onkeydown={(e) => e.key === 'Enter' && !locked && onselect(region.id)}
			onmouseenter={() => (hovered.region = region.id)}
			onmouseleave={() => (hovered.region = '')}
			data-testid="region-select-{region.id}"
		>
			{region.name}
		</button>
	{/each}
	{#if hovered.region}
		{@const region = province.regions.find((r) => r.id === hovered.region)!}
		<span class="hint" data-testid="map-hint">
			{#if region.unlocked}
				<b>{region.name}</b> — {region.settlements.map((s) => s.name).join(', ')}
			{:else}
				<b>{region.name}</b> — freigeschaltet in einem späteren Zeitalter (M1 nicht spielbar)
			{/if}
		</span>
	{:else}
		<span class="hint" data-testid="map-hint-empty">Region wählen…</span>
	{/if}
</div>

<style>
	.selector {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		padding: 8px 10px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: #fff;
	}
	.region {
		font-size: 12px;
		padding: 4px 10px;
		border: 1px solid #cbd5e1;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		white-space: nowrap;
	}
	.region.selected {
		background: #0369a1;
		color: #fff;
		border-color: #0369a1;
	}
	.region.locked {
		color: #94a3b8;
		background: #f1f5f9;
		border-color: #e2e8f0;
		cursor: not-allowed;
	}
	.hint {
		font-size: 12px;
		color: #475569;
		flex: 1;
		min-width: 140px;
		text-align: right;
	}
</style>
