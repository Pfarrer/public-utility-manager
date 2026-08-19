<script lang="ts">
	/**
	 * City view: the selected region's settlements as polygon footprints on a
	 * 1890s-style paper canvas — grey base, warm illumination around running
	 * plants (clipped to the polygon), animated plant icons, flow lines,
	 * blackout flicker, stage-up highlight (change: add-city-view).
	 */
	import { province } from '$lib/game/scenario';
	import { plantAvailableCapacity } from '$lib/game/plant';
	import {
		plantAnchor,
		ringCentroid,
		ringMaxRadius,
		settlementIndexForPlant,
		stageFor
	} from '$lib/game/geometry';
	import type { GameState, Plant } from '$lib/game/types';

	let { game, regionId }: { game: GameState; regionId: string } = $props();

	const W = 1000;
	const H = 700;

	const region = $derived(province.regions.find((r) => r.id === regionId));
	const blackout = $derived(game.systems.dispatch.current[regionId]?.blackout ?? false);

	/** Plants of this region, assigned to display settlements deterministically. */
	const plantsBySettlement = $derived.by(() => {
		const map = new Map<string, Plant[]>();
		if (!region) return map;
		for (const plant of game.systems.construction.plants) {
			if (plant.regionId !== regionId) continue;
			const idx = settlementIndexForPlant(region.settlements.length, `${regionId}#${plant.id}`);
			const settlement = region.settlements[idx];
			if (!settlement) continue;
			const list = map.get(settlement.id) ?? [];
			list.push(plant);
			map.set(settlement.id, list);
		}
		return map;
	});

	/**
	 * Region grid state (change: region-grid-lighting): the region is one
	 * grid — live whenever any plant in the region has available capacity.
	 * Mirrors the sim core, which dispatches region aggregate demand against
	 * region aggregate capacity.
	 */
	const gridLive = $derived.by(() => {
		if (!region) return false;
		return game.systems.construction.plants.some(
			(p) => p.regionId === regionId && plantAvailableCapacity(p) > 0
		);
	});

	/** Running plant anchors of the region (grid feed-in points). */
	const runningAnchors = $derived.by(() => {
		if (!region || !gridLive) return [];
		const anchors: { x: number; y: number; plantId: number }[] = [];
		for (const [settlementId, list] of plantsBySettlement) {
			const settlement = region.settlements.find((s) => s.id === settlementId);
			if (!settlement) continue;
			for (const p of list) {
				if (plantAvailableCapacity(p) <= 0) continue;
				const a = plantAnchor(settlement.geometry, `${settlement.id}#${p.id}`);
				anchors.push({ x: a.x, y: a.y, plantId: p.id });
			}
		}
		return anchors;
	});

	interface PlantView {
		id: number;
		operational: boolean;
		x: number;
		y: number;
	}

	interface SettlementView {
		id: string;
		name: string;
		households: number;
		stageIndex: number;
		ring: string;
		centroidX: number;
		centroidY: number;
		/** Top of the polygon (for label placement). */
		labelY: number;
		/** Illumination radius; 0 when the region grid is not live. */
		glowR: number;
		/** Distribution line source: nearest running plant anchor (null if none). */
		feed: { x: number; y: number } | null;
		plants: PlantView[];
	}

	const settlements = $derived.by(() => {
		if (!region) return [];
		const views: SettlementView[] = [];
		for (const settlement of region.settlements) {
			const hh = game.systems.growth.households[settlement.id];
			const total = hh
				? hh.wealthy + hh.average + hh.poor
				: settlement.households.wealthy +
					settlement.households.average +
					settlement.households.poor;
			const stageIndex = stageFor(settlement.geometry, total);
			const ring = settlement.geometry.stages[stageIndex].ring;
			const centroid = ringCentroid(ring);
			const maxR = ringMaxRadius(ring);

			// Household-weighted electrification share of this settlement.
			const shares = game.systems.growth.shares[settlement.id];
			let share = 0;
			if (hh && shares) {
				let connected = 0;
				for (const cat of ['wealthy', 'average', 'poor'] as const) {
					connected += hh[cat] * shares[cat];
				}
				share = total > 0 ? connected / total : 0;
			}

			// Region grid: any running plant feeds every settlement (change:
			// region-grid-lighting). The lit area fraction equals the settlement's
			// household-weighted electrification share (r ~ sqrt(share) · maxR).
			const glowR = gridLive ? maxR * Math.sqrt(share) : 0;

			// Distribution line: nearest running plant anchor → this settlement.
			let feed: { x: number; y: number } | null = null;
			if (glowR > 0 && runningAnchors.length > 0) {
				let best = runningAnchors[0];
				let bestDist = Infinity;
				for (const a of runningAnchors) {
					const d = (a.x - centroid.x) ** 2 + (a.y - centroid.y) ** 2;
					if (d < bestDist) {
						bestDist = d;
						best = a;
					}
				}
				feed = { x: best.x, y: best.y };
			}

			const plantsHere = plantsBySettlement.get(settlement.id) ?? [];

			views.push({
				id: settlement.id,
				name: settlement.name,
				households: total,
				stageIndex,
				ring,
				centroidX: centroid.x,
				centroidY: centroid.y,
				labelY: centroid.y - maxR,
				glowR,
				feed,
				plants: plantsHere.map((p) => {
					const anchor = plantAnchor(settlement.geometry, `${settlement.id}#${p.id}`);
					return {
						id: p.id,
						operational: plantAvailableCapacity(p) > 0,
						x: anchor.x,
						y: anchor.y
					};
				})
			});
		}
		return views;
	});

	// Stage-up detection: remember each settlement's stage across renders;
	// a change highlights the polygon briefly (celebration, no sim effect).
	const lastStage = new Map<string, number>();
	let highlighted = $state<string[]>([]);
	$effect(() => {
		settlements; // track
		const changed: string[] = [];
		for (const s of settlements) {
			const prev = lastStage.get(s.id);
			if (prev !== undefined && prev !== s.stageIndex) changed.push(s.id);
			lastStage.set(s.id, s.stageIndex);
		}
		if (changed.length > 0) {
			highlighted = changed;
			const timer = setTimeout(() => (highlighted = []), 1600);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="city" data-testid="city-canvas">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Stadtansicht {region?.name ?? ''}">
		<defs>
			<radialGradient id="glow" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#fbbf24" stop-opacity="0.95" />
				<stop offset="55%" stop-color="#f59e0b" stop-opacity="0.55" />
				<stop offset="100%" stop-color="#b45309" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="paper" cx="30%" cy="25%" r="90%">
				<stop offset="0%" stop-color="#f5ead3" />
				<stop offset="100%" stop-color="#e8dcc0" />
			</radialGradient>
		</defs>

		<rect x="0" y="0" width={W} height={H} fill="url(#paper)" />

		<!-- distribution lines (region grid): running plant → lit settlements -->
		{#if gridLive}
			{#each settlements as s (s.id)}
				{#if s.feed}
					<line
						class="flow"
						x1={s.feed.x}
						y1={s.feed.y}
						x2={s.centroidX}
						y2={s.centroidY}
						data-testid="grid-flow-{s.id}"
					/>
				{/if}
			{/each}
		{/if}

		{#each settlements as s (s.id)}
			{@const isHi = highlighted.includes(s.id)}
			<g
				class="settlement"
				class:blackout
				class:stage-up={isHi}
				data-testid="city-settlement-{s.id}"
				data-stage-index={s.stageIndex}
				data-glow={s.glowR.toFixed(1)}
			>
				<!-- base polygon (grey) -->
				<path class="ring" d={s.ring} />

				<!-- illumination centred on the settlement, clipped to the ring -->
				{#if s.glowR > 0}
					<clipPath id="clip-{s.id}">
						<path d={s.ring} />
					</clipPath>
					<g class="illumination" clip-path="url(#clip-{s.id})">
						<circle cx={s.centroidX} cy={s.centroidY} r={s.glowR} fill="url(#glow)" />
					</g>
				{/if}

				<!-- plant icons -->
				{#each s.plants as p (p.id)}
					{#if p.operational}
						<g class="plant running" data-testid="city-plant-{p.id}">
							<circle class="plant-base" cx={p.x} cy={p.y} r="14" />
							<circle class="plant-hub" cx={p.x} cy={p.y} r="5" />
							<g class="flywheel">
								<line x1={p.x - 10} y1={p.y} x2={p.x + 10} y2={p.y} />
								<line x1={p.x} y1={p.y - 10} x2={p.x} y2={p.y + 10} />
							</g>
						</g>
					{:else}
						<g class="plant building" data-testid="city-plant-{p.id}">
							<rect class="scaffold" x={p.x - 11} y={p.y - 11} width="22" height="22" />
							<line x1={p.x - 11} y1={p.y - 11} x2={p.x + 11} y2={p.y + 11} />
							<line x1={p.x + 11} y1={p.y - 11} x2={p.x - 11} y2={p.y + 11} />
						</g>
					{/if}
				{/each}

				<!-- labels -->
				<text class="label" x={s.centroidX} y={s.labelY - 10} text-anchor="middle">
					{s.name}
				</text>
				<text class="caption" x={s.centroidX} y={s.labelY + 6} text-anchor="middle">
					{s.households.toLocaleString('de-DE')}&#8201;Haushalte
				</text>
				{#if isHi}
					<text class="stageup" x={s.centroidX} y={s.labelY - 30} text-anchor="middle" data-testid="city-stage-highlight">
						▲ Die Stadt wächst
					</text>
				{/if}
			</g>
		{/each}
	</svg>
	{#if blackout}
		<div class="blackout-note" data-testid="blackout-note">Stromausfall — Netzlast nicht gedeckt</div>
	{/if}
</div>

<style>
	.city {
		position: relative;
		border: 1px solid #d8c9a3;
		border-radius: 8px;
		overflow: hidden;
		background: #efe5cc;
	}
	.city svg {
		width: 100%;
		height: auto;
		display: block;
	}
	/* 1890s print palette: sepia linework on paper */
	.settlement .ring {
		fill: #c9bfa8;
		stroke: #6b5d42;
		stroke-width: 2;
	}
	.settlement .label {
		font-size: 20px;
		font-weight: 600;
		fill: #4a3b26;
		font-family: Georgia, 'Times New Roman', serif;
	}
	.settlement .caption {
		font-size: 13px;
		fill: #7a6a4f;
		font-family: Georgia, 'Times New Roman', serif;
	}
	.settlement .stageup {
		font-size: 14px;
		font-weight: 600;
		fill: #b45309;
		font-family: Georgia, 'Times New Roman', serif;
	}
	.plant.running .plant-base {
		fill: #8a5a2a;
		stroke: #4a3b26;
		stroke-width: 2;
	}
	.plant.running .plant-hub {
		fill: #fbbf24;
	}
	.plant.running .flywheel {
		animation: spin 2.4s linear infinite;
		transform-origin: center;
		transform-box: fill-box;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.plant.building .scaffold {
		fill: none;
		stroke: #8a7a5a;
		stroke-width: 2;
		stroke-dasharray: 4 3;
	}
	.flow {
		stroke: #b45309;
		stroke-width: 2;
		stroke-dasharray: 6 6;
		animation: flowdash 1.2s linear infinite;
	}
	@keyframes flowdash {
		to {
			stroke-dashoffset: -24;
		}
	}
	.settlement.blackout .illumination {
		animation: flicker 0.9s steps(2, end) infinite;
	}
	@keyframes flicker {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
		100% {
			opacity: 1;
		}
	}
	.settlement.stage-up .ring {
		stroke: #b45309;
		stroke-width: 3;
	}
	.blackout-note {
		position: absolute;
		top: 10px;
		left: 50%;
		transform: translateX(-50%);
		background: #7f1d1d;
		color: #fde68a;
		font-size: 12px;
		padding: 4px 12px;
		border-radius: 12px;
	}
</style>
