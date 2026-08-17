<script lang="ts">
	/**
	 * Game shell: owns the GameState, the RAF game loop (pause/×1/×4),
	 * manual quarter advance, tariff control, tram offer, modals, history.
	 */
	import { tick as tickSim, createInitialState } from '$lib/game/sim';
	import { decideTram, tramActive } from '$lib/game/events';
	import { economy, setTariff } from '$lib/game/economy';
	import type { GameState, Newspaper, AnnualReport } from '$lib/game/types';
	import ProvinceMap from './ProvinceMap.svelte';
	import RegionDetail from './RegionDetail.svelte';
	import DemandChart from './DemandChart.svelte';
	import PlantPanel from './PlantPanel.svelte';
	import NewspaperModal from './NewspaperModal.svelte';
	import ReportModal from './ReportModal.svelte';
	import GameOverOverlay from './GameOverOverlay.svelte';

	let {
		initialState = createInitialState(),
		quarterMs = 4000,
		autoRun = true
	}: { initialState?: GameState; quarterMs?: number; autoRun?: boolean } = $props();

	// svelte-ignore state_referenced_locally
	let game = $state(initialState); // intentionally captures the initial state once
	let speed = $state(0); // 0 = pause, 1 = ×1, 4 = ×4
	let selectedRegion = $state('region-coast');

	// Modal bookkeeping: how many newspapers the player has already seen.
	// Starts at 0 so a loaded state still presents its latest paper once.
	let papersSeen = $state(0);
	let openPaper: Newspaper | null = $state(null);
	let openReport: AnnualReport | null = $state(null);

	const paper = $derived(game.systems.events.newspapers.at(-1) ?? null);
	const unseenPaper = $derived(
		game.systems.events.newspapers.length > papersSeen ? paper : null
	);
	const tram = $derived(game.systems.events.tram);

	/** Advance one quarter (manual step and RAF both use this). */
	export function step(): void {
		if (game.gameOver) return;
		game = tickSim(game);
	}

	/** Read access for tests (and later persistence). */
	export function snapshot(): GameState {
		return game;
	}

	function restart(): void {
		game = createInitialState();
		papersSeen = 0;
		openPaper = null;
		openReport = null;
		speed = 0;
		selectedRegion = 'region-coast';
	}

	function dismissPaper(): void {
		papersSeen = game.systems.events.newspapers.length;
		openPaper = null;
	}

	function showPaper(p: Newspaper): void {
		openPaper = p;
	}

	function showReport(r: AnnualReport): void {
		openReport = r;
	}

	function decide(accept: boolean): void {
		decideTram(game, accept);
	}

	// Tariff control -----------------------------------------------------------
	// svelte-ignore state_referenced_locally
	let tariffInput = $state(game.systems.economy.tariff); // initial value once; restart resets via game
	let tariffNote = $state('');
	function applyTariff(): void {
		const before = game.systems.economy.tariff;
		setTariff(game, tariffInput);
		tariffInput = game.systems.economy.tariff;
		tariffNote = tariffInput !== before ? `Tarif auf ${economy.tariffMin.toFixed(2)}–${economy.tariffMax.toFixed(2)} ¤/kWh begrenzt` : '';
	}

	// Game loop: RAF accumulator ----------------------------------------------
	let lastTs = 0;
	let acc = 0;
	$effect(() => {
		if (!autoRun || speed === 0 || game.gameOver) return;
		lastTs = 0;
		acc = 0;
		const raf = (ts: number): void => {
			if (lastTs === 0) lastTs = ts;
			acc += (ts - lastTs) * speed;
			lastTs = ts;
			while (acc >= quarterMs && !game.gameOver) {
				step();
				acc -= quarterMs;
			}
			requestAnimationFrame(raf);
		};
		const handle = requestAnimationFrame(raf);
		return () => cancelAnimationFrame(handle);
	});
</script>

<div class="shell" data-testid="game-shell">
	<header class="topbar">
		<b>Public Utility Manager</b>
		<span data-testid="clock">{game.clock.year} — Q{game.clock.quarter}</span>
		<span data-testid="cash">{game.cash.toLocaleString('de-DE')} ¤</span>
		<span class="spacer"></span>
		{#if tram.phase === 'offered' || tram.phase === 'reoffered'}
			<span class="badge" data-testid="tram-badge">Angebot der Straßenbahn!</span>
		{/if}
		{#if game.gameOver}<span class="badge bad">insolvent</span>{/if}
		<button class:active="{speed === 0}" onclick={() => (speed = 0)} data-testid="speed-pause">Pause</button>
		<button class:active="{speed === 1}" onclick={() => (speed = 1)} data-testid="speed-1">×1</button>
		<button class:active="{speed === 4}" onclick={() => (speed = 4)} data-testid="speed-4">×4</button>
		<button onclick={step} disabled={game.gameOver} data-testid="step-button">Quartal abschließen</button>
	</header>

	<main class="grid">
		<div class="col">
			<ProvinceMap selected={selectedRegion} onselect={(id: string) => (selectedRegion = id)} />
			<RegionDetail {game} regionId={selectedRegion} />
			{#if game.systems.demand.current[selectedRegion]}
				<DemandChart
					curve={game.systems.demand.current[selectedRegion]}
					capacity={game.systems.dispatch.current[selectedRegion]?.capacityKw ?? 0}
					title="Tageslast (kW) — Kapazität gestrichelt"
				/>
			{:else}
				<p class="muted">Noch keine Nachfragedaten — beende das erste Quartal.</p>
			{/if}
		</div>

		<div class="col">
			<section class="panel">
				<h3>Tarif</h3>
				<label class="tariff">
					<input
						type="range"
						min={economy.tariffMin}
						max={economy.tariffMax}
						step="0.05"
						bind:value={tariffInput}
						onchange={applyTariff}
						data-testid="tariff-slider"
					/>
					<span data-testid="tariff-value">{tariffInput.toFixed(2)} ¤/kWh</span>
				</label>
				{#if tariffNote}<p class="note" data-testid="tariff-note">{tariffNote}</p>{/if}
			</section>

			<PlantPanel {game} onaction={() => (game = game)} />

			{#if tram.phase === 'offered' || tram.phase === 'reoffered'}
				<section class="panel tram" data-testid="tram-offer">
					<h3>Straßenbahn-Vertrag</h3>
					<p>
						Die Straßenbahngesellschaft der Hafenstadt fordert {80} kW Basislast
						zum Tarif von {(tram.tariffShare * 100).toFixed(0)} % des Haushaltstarifs,
						Laufzeit 5 Jahre. Bei Ausfällen droht doppelter Unmut.
					</p>
					<button onclick={() => decide(true)} data-testid="tram-accept">Annehmen</button>
					<button onclick={() => decide(false)} data-testid="tram-reject">Ablehnen</button>
				</section>
			{:else if tramActive(game)}
				<section class="panel">
					<h3>Straßenbahn-Vertrag</h3>
					<p class="muted">Aktiv seit {tram.contractStartYear} — {80} kW Basislast, läuft 5 Jahre.</p>
				</section>
			{/if}

			<section class="panel">
				<h3>Geschichte</h3>
				{#if game.systems.events.newspapers.length === 0}
					<p class="muted">Noch keine Zeitung erschienen.</p>
				{:else}
					<ul class="history">
						{#each game.systems.events.newspapers as p (p.year)}
							<li>
								<button onclick={() => showPaper(p)} data-testid="history-paper-{p.year}">
									Zeitung {p.year}
								</button>
								{#if game.systems.economy.annualReports.find((r) => r.year === p.year)}
									<button
										onclick={() =>
											showReport(
												game.systems.economy.annualReports.find((r) => r.year === p.year)!
											)}
										data-testid="history-report-{p.year}"
									>
										Abschluss {p.year}
									</button>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>
	</main>
</div>

{#if openPaper}
	<NewspaperModal newspaper={openPaper} ondismiss={() => (openPaper = null)} />
{:else if unseenPaper}
	<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
	<div class="yearclose" onclick={() => showPaper(unseenPaper!)} data-testid="year-close">
		<div class="card" role="button" tabindex="0">
			<b>Jahr {unseenPaper.year} ist vergangen</b>
			<p>Die Zeitung ist erschienen.</p>
			<button onclick={() => showPaper(unseenPaper!)} data-testid="year-close-open">Zeitung lesen</button>
		</div>
	</div>
{/if}

{#if openReport}
	<ReportModal report={openReport} ondismiss={() => (openReport = null)} />
{/if}

{#if game.gameOver}
	<GameOverOverlay year={game.clock.year} reason="Zu viele Quartale mit negativem Kontostand." onrestart={restart} />
{/if}

<style>
	.shell { max-width: 1060px; margin: 0 auto; padding: 12px; font-family: system-ui, sans-serif; }
	.topbar {
		display: flex; gap: 10px; align-items: center; padding: 8px 12px;
		border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; margin-bottom: 12px;
	}
	.spacer { flex: 1; }
	.badge { background: #b45309; color: #fff; border-radius: 10px; padding: 2px 8px; font-size: 11px; }
	.badge.bad { background: #dc2626; }
	button { font-size: 12px; padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; cursor: pointer; }
	button.active { background: #0369a1; color: #fff; border-color: #0369a1; }
	button:disabled { opacity: 0.5; cursor: not-allowed; }
	.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
	.col { display: grid; gap: 12px; }
	.panel { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #fff; }
	.panel h3 { margin: 0 0 8px; font-size: 14px; }
	.muted { color: #94a3b8; font-size: 12px; }
	.tariff { display: flex; gap: 10px; align-items: center; font-size: 12px; }
	.tariff input[type='range'] { flex: 1; }
	.note { color: #b45309; font-size: 11px; margin: 6px 0 0; }
	.history { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
	.history li { display: flex; gap: 6px; }
	.tram { border-color: #b45309; }
	.yearclose {
		position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
		display: flex; align-items: center; justify-content: center; z-index: 20;
	}
	.card { background: #fff; border-radius: 10px; padding: 18px 24px; text-align: center; }
	.card p { color: #64748b; font-size: 13px; }
</style>
