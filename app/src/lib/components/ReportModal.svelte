<script lang="ts">
	/** Annual report modal: transaction totals per kind + net for the year. */
	let {
		report,
		ondismiss
	}: {
		report: { year: number; totals: Record<string, number>; net: number };
		ondismiss: () => void;
	} = $props();

	const KIND_LABELS: Record<string, string> = {
		revenue: 'Einnahmen',
		fuel: 'Brennstoff',
		wages: 'Löhne',
		construction: 'Bau (Memo)'
	};
</script>

<div class="backdrop" role="presentation">
	<section class="modal" data-testid="report-modal" aria-label="Jahresabschluss">
		<header><h2>Jahresabschluss {report.year}</h2></header>
		<table>
			<tbody>
			{#each Object.entries(report.totals) as [kind, total] (kind)}
				<tr>
					<td>{KIND_LABELS[kind] ?? kind}</td>
					<td class:neg={total < 0}>{total.toLocaleString('de-DE') + ' ¤'}</td>
				</tr>
			{/each}
			<tr class="net">
				<td>Jahresergebnis</td>
				<td class:neg={report.net < 0}>{report.net.toLocaleString('de-DE') + ' ¤'}</td>
			</tr>
			</tbody>
		</table>
		<footer>
			<button onclick={ondismiss} data-testid="report-dismiss">Schließen</button>
		</footer>
	</section>
</div>

<style>
	.backdrop {
		position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
		display: flex; align-items: center; justify-content: center; z-index: 30;
	}
	.modal {
		background: #fff; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 8px;
		width: min(420px, 90vw); padding: 16px 20px;
	}
	h2 { margin: 0 0 10px; font-size: 16px; }
	table { width: 100%; border-collapse: collapse; font-size: 13px; }
	td { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
	td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
	.neg { color: #dc2626; }
	.net td { font-weight: 700; border-top: 2px solid #0f172a; }
	footer { margin-top: 12px; text-align: right; }
</style>
