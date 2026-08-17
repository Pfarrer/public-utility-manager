<script lang="ts">
	/** Game-over overlay: final report summary + restart. Blocks all play input. */
	let {
		year,
		reason,
		onrestart
	}: {
		year: number;
		reason: string;
		onrestart: () => void;
	} = $props();
</script>

<div class="backdrop" data-testid="gameover-overlay">
	<section class="modal">
		<h1>Spielende</h1>
		<p>Das Unternehmen ist im Jahr {year} insolvent.</p>
		<p class="muted">{reason}</p>
		<button onclick={onrestart} data-testid="restart">Neu beginnen</button>
	</section>
</div>

<style>
	.backdrop {
		position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75);
		display: flex; align-items: center; justify-content: center; z-index: 50;
	}
	.modal {
		background: #1e293b; color: #f1f5f9; border-radius: 12px;
		padding: 24px 28px; text-align: center;
	}
	h1 { margin: 0 0 8px; font-size: 22px; }
	p { margin: 4px 0; }
	.muted { color: #94a3b8; font-size: 13px; }
	button { margin-top: 12px; }
</style>
