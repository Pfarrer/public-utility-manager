<script lang="ts">
	/**
	 * Schematic province map: four region frames, settlements as circles
	 * sized by population, locked regions greyed with an unlock hint.
	 */
	import { province } from '$lib/game/scenario';

	let {
		selected = 'region-coast',
		onselect = () => {}
	}: {
		selected?: string;
		onselect?: (regionId: string) => void;
	} = $props();

	const W = 320;
	const H = 200;

	/** Hand-tuned frames per region (4 fixed regions, M1). */
	const frames: Record<string, { x: number; y: number; w: number; h: number; label: string }> = {
		'region-coast': { x: 8, y: 8, w: 150, h: 88, label: 'Küstenmark' },
		'region-mountains': { x: 162, y: 8, w: 150, h: 88, label: 'Bergland' },
		'region-highland': { x: 8, y: 100, w: 150, h: 88, label: 'Hochland' },
		'region-farmland': { x: 162, y: 100, w: 150, h: 88, label: 'Ackerland' }
	};

	const hovered = $state({ region: '' });

	/** Population → circle radius (4–10 px). */
	function radius(pop: number): number {
		return 4 + Math.min(6, Math.round(pop / 2000));
	}

	const settlements = $derived(
		Object.fromEntries(
			province.regions.map((r) => [
				r.id,
				r.settlements.map((s, i) => ({
					...s,
					cx: frames[r.id].x + 28 + i * 55,
					cy: frames[r.id].y + 50,
					r: radius(s.population)
				}))
			])
		)
	);
</script>

<div class="map">
	<svg viewBox="0 0 {W} {H}" data-testid="province-map">
		{#each province.regions as region (region.id)}
			{@const frame = frames[region.id]}
			{@const locked = !region.unlocked}
			<g
				class="region"
				class:locked
				class:selected={selected === region.id}
				role="button"
				tabindex={locked ? -1 : 0}
				onclick={() => onselect(region.id)}
				onkeydown={(e) => e.key === 'Enter' && !locked && onselect(region.id)}
				onmouseenter={() => (hovered.region = region.id)}
				onmouseleave={() => (hovered.region = '')}
			>
				<rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx="6" />
				<text x={frame.x + 8} y={frame.y + 18} font-size="11" font-weight="600">{frame.label}</text>
				{#if locked}
					<text x={frame.x + frame.w / 2} y={frame.y + frame.h - 10} font-size="9" fill="#94a3b8" text-anchor="middle">
						gesperrt — späteres Zeitalter
					</text>
				{/if}
				{#each settlements[region.id] as s (s.id)}
					<circle cx={s.cx} cy={s.cy} r={s.r} fill={locked ? '#cbd5e1' : '#0369a1'} />
					<text x={s.cx} y={s.cy + s.r + 10} font-size="8" text-anchor="middle" fill={locked ? '#94a3b8' : '#334155'}>
						{s.name}
					</text>
				{/each}
			</g>
		{/each}
	</svg>
	{#if hovered.region}
		{@const region = province.regions.find((r) => r.id === hovered.region)!}
		<div class="hint" data-testid="map-hint">
			{#if region.unlocked}
				<b>{region.name}</b> — {region.settlements.map((s) => s.name).join(', ')}
			{:else}
				<b>{region.name}</b> — freigeschaltet in einem späteren Zeitalter (M1 nicht spielbar)
			{/if}
		</div>
	{:else}
		<div class="hint" data-testid="map-hint-empty">Region wählen…</div>
	{/if}
</div>

<style>
	.map svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.region rect {
		fill: #f8fafc;
		stroke: #cbd5e1;
		cursor: pointer;
	}
	.region.locked rect {
		fill: #f1f5f9;
		stroke: #e2e8f0;
	}
	.region.selected rect {
		stroke: #0369a1;
		stroke-width: 2;
	}
	.region text {
		pointer-events: none;
		user-select: none;
	}
	.hint {
		font-size: 12px;
		color: #475569;
		padding: 4px 2px;
		min-height: 1.4em;
	}
</style>
