<script lang="ts">
	/**
	 * Plant panel: components, construction queue, expansion orders.
	 */
	import {
		buildings,
		createPlant,
		orderComponent,
		plantAvailableCapacity,
		plantCurrentType,
		plantInstalledCapacity,
		plantRequiredCrew
	} from '$lib/game/plant';
	import type { GameState } from '$lib/game/types';

	let {
		game,
		onaction
	}: {
		game: GameState;
		/** Propagate a state-mutating action so the shell can re-render. */
		onaction: () => void;
	} = $props();

	const plants = $derived(game.systems.construction.plants);
	const queue = $derived(
		plants.flatMap((p) =>
			p.components
				.filter((c) => c.status === 'under_construction')
				.map((c) => ({
					plant: p,
					component: c,
					spec: buildings.engines.get(c.componentId) ?? buildings.generators.get(c.componentId)!
				})
			)
		)
	);
	let orderFeedback = $state('');

	function nameOf(componentId: string): string {
		return (
			buildings.engines.get(componentId)?.name ??
			buildings.generators.get(componentId)?.name ??
			componentId
		);
	}

	function createFirstPlant(): void {
		createPlant(game, 'region-coast', 'Kraftwerk Hafenstadt');
		onaction();
	}

	function order(plantId: number, componentId: string): void {
		const result = orderComponent(game, plantId, componentId);
		orderFeedback = result.ok ? '' : result.reason;
		onaction();
	}
</script>

<section class="panel" data-testid="plant-panel">
	<h3>Kraftwerke</h3>

	{#if plants.length === 0}
		<p>Noch kein Kraftwerk.</p>
		<button onclick={createFirstPlant} data-testid="create-first-plant">Erstes Kraftwerk errichten</button>
	{:else}
		{#each plants as plant (plant.id)}
			<article class="plant" data-testid="plant-card">
				<header>
					<b>{plant.name}</b>
					<span class="current-badge" data-testid="plant-current-{plant.id}">
						{plantCurrentType(plant) === 'ac' ? '~' : '⎓'}
					</span>
					<span class="muted">
						{plantInstalledCapacity(plant).toFixed(0)}&nbsp;kW installiert ·
						{plantAvailableCapacity(plant).toFixed(0)}&nbsp;kW verfügbar
					</span>
				</header>
				<p class="muted" data-testid="staff-line-{plant.id}">
					Belegschaft: {plantRequiredCrew(plant)}&nbsp;Arbeiter (automatisch)
				</p>
				<ul>
					{#each plant.components as c (c.id)}
						<li class:op="{c.status === 'operational'}" class:building="{c.status === 'under_construction'}">
							{nameOf(c.componentId)}
							{#if c.status === 'under_construction'}(Bau, {c.remaining} Q){/if}
						</li>
					{:else}
						<li class="muted">keine Komponenten</li>
					{/each}
				</ul>
				<div class="row">
					<button onclick={() => order(plant.id, 'steam-engine-1890')} data-testid="order-engine-{plant.id}">
						+ Maschine (8.000&nbsp;$)
					</button>
					<button onclick={() => order(plant.id, 'generator-50kw')} data-testid="order-generator-{plant.id}">
						+ Dynamo (5.000&nbsp;$)
					</button>
				</div>
			</article>
		{/each}
		{#if orderFeedback}<p class="error" data-testid="order-feedback">{orderFeedback}</p>{/if}
		{#if queue.length > 0}
			<h4>Bau-Queue</h4>
			<ul>
				{#each queue as q (q.component.id)}
					<li>{q.plant.name}: {q.spec.name} — noch {q.component.remaining} Quartal(e)</li>
				{/each}
			</ul>
		{/if}
	{/if}
</section>

<style>
	.panel { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #fff; }
	h3 { margin: 0 0 8px; font-size: 14px; }
	h4 { margin: 10px 0 4px; font-size: 12px; color: #475569; }
	.plant { border-top: 1px solid #f1f5f9; padding: 8px 0; }
	.plant header { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
	/* current-type badge (⎓ direct current / ~ alternating current) */
	.current-badge {
		font-size: 12px;
		font-weight: 700;
		color: #4a3b26;
		background: #f8f3e6;
		border: 1px solid #4a3b26;
		border-radius: 999px;
		padding: 0 6px;
		line-height: 18px;
	}
	.muted { color: #94a3b8; font-size: 11px; }
	ul { margin: 4px 0; padding-left: 16px; font-size: 12px; }
	li.op { color: #047857; }
	li.building { color: #b45309; }
	.row { display: flex; gap: 8px; align-items: center; margin-top: 6px; flex-wrap: wrap; font-size: 12px; }
	.row button { white-space: nowrap; }
	.error { color: #dc2626; font-size: 12px; }
</style>
