<script lang="ts">
	/**
	 * Newspaper modal: headline + the closed year's game messages.
	 * Dismissable; reachable again from the history list (GameShell owns that).
	 */
	let {
		newspaper,
		ondismiss
	}: {
		newspaper: { year: number; headline: string; messages: { text: string }[] };
		ondismiss: () => void;
	} = $props();
</script>

<div class="backdrop" role="presentation">
	<section class="modal" data-testid="newspaper-modal" aria-label="Zeitung">
		<header>
			<span class="masthead">Westmark-Kurier</span>
			<span class="year">{newspaper.year}</span>
		</header>
		<h2>„{newspaper.headline}“</h2>
		{#if newspaper.messages.length > 0}
			<ul>
				{#each newspaper.messages as m, i (i)}
					<li>{m.text}</li>
				{/each}
			</ul>
		{:else}
			<p class="muted">Keine weiteren Meldungen.</p>
		{/if}
		<footer>
			<button onclick={ondismiss} data-testid="newspaper-dismiss">Schließen</button>
		</footer>
	</section>
</div>

<style>
	.backdrop {
		position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
		display: flex; align-items: center; justify-content: center; z-index: 30;
	}
	.modal {
		background: #fdf6e3; color: #1c1917; border: 2px solid #1c1917; border-radius: 4px;
		width: min(480px, 90vw); padding: 16px 20px;
		font-family: Georgia, 'Times New Roman', serif;
	}
	header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px double #1c1917; padding-bottom: 6px; }
	.masthead { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
	.year { font-size: 14px; }
	h2 { font-size: 16px; margin: 12px 0 8px; }
	ul { margin: 0 0 8px; padding-left: 18px; font-size: 13px; }
	.muted { color: #78716c; font-size: 13px; }
	footer { border-top: 1px solid #d6d3d1; padding-top: 8px; text-align: right; }
</style>
