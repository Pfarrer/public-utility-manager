<script lang="ts">
	/**
	 * App root: decides the initial state — resume from localStorage when a
	 * valid save exists (banner), otherwise a fresh 1890 game. Corrupt or
	 * version-mismatched saves are cleared so the game always starts.
	 */
	import { onMount } from 'svelte';
	import GameShell from './GameShell.svelte';
	import { clearSave, hasSave, loadGame } from '$lib/game/persistence';
	import { createInitialState } from '$lib/game/sim';
	import type { GameState } from '$lib/game/types';

	let initial: GameState | null = $state(null);
	let resumed = $state(false);

	onMount(() => {
		if (hasSave()) {
			try {
				initial = loadGame();
				resumed = true;
				return;
			} catch {
				clearSave(); // corrupt or old version — start fresh
			}
		}
		initial = createInitialState();
	});
</script>

{#if initial}
	{#if resumed}
		<div class="resume" data-testid="resume-banner">
			Spielstand geladen — {initial.clock.year} Q{initial.clock.quarter}
		</div>
	{/if}
	<GameShell initialState={initial} />
{:else}
	<p data-testid="loading">Lade …</p>
{/if}

<style>
	.resume {
		background: #1d4ed8;
		color: white;
		padding: 0.4rem 1rem;
		font-size: 0.85rem;
	}
</style>
