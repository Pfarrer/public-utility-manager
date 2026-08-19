/** Game events — newspaper, coal crisis, tram deal state machine (change: add-game-events). */

import * as v from 'valibot';
import historyJson from '$lib/data/history.json';
import { economy } from './economy';
import { province } from './scenario';
import { drawFloat } from './rng';
import type { EventsState, GameState, GameMessage, Newspaper } from './types';

// ---------------------------------------------------------------------------
// History data (JSON + valibot, fail-fast)
// ---------------------------------------------------------------------------

const YearSchema = v.pipe(v.number(), v.integer(), v.minValue(1800), v.maxValue(2200));

const HeadlineSchema = v.object({
	year: YearSchema,
	text: v.pipe(v.string(), v.minLength(1))
});

const TramDealSchema = v.object({
	regionId: v.pipe(v.string(), v.minLength(1)),
	settlementIds: v.pipe(v.array(v.pipe(v.string(), v.minLength(1))), v.minLength(1)),
	offerYear: YearSchema,
	loadKw: v.pipe(v.number(), v.minValue(0)),
	tariffShare: v.pipe(v.number(), v.minValue(0.01), v.maxValue(1)),
	reofferTariffShare: v.pipe(v.number(), v.minValue(0.01), v.maxValue(1)),
	reofferProbability: v.pipe(v.number(), v.minValue(0), v.maxValue(1)),
	durationYears: v.pipe(v.number(), v.integer(), v.minValue(1)),
	growthBoost: v.pipe(v.number(), v.minValue(0.1), v.maxValue(5))
});

const HistorySchema = v.object({
	headlines: v.pipe(
		v.array(HeadlineSchema),
		v.minLength(1),
		v.check((items) => new Set(items.map((h) => h.year)).size === items.length, 'headline years must be unique')
	),
	crisis: v.object({
		announceYear: v.pipe(v.number(), v.integer(), v.minValue(1800)),
		startYear: v.pipe(v.number(), v.integer(), v.minValue(1800))
	}),
	tramDeal: TramDealSchema
});

export interface HistoryData {
	headlines: { year: number; text: string }[];
	crisis: { announceYear: number; startYear: number };
	tramDeal: {
		regionId: string;
		settlementIds: string[];
		offerYear: number;
		loadKw: number;
		tariffShare: number;
		reofferTariffShare: number;
		reofferProbability: number;
		durationYears: number;
		growthBoost: number;
	};
}

/** Validate history data. Throws naming the offending field. */
export function loadHistory(data: unknown): HistoryData {
	const result = v.safeParse(HistorySchema, data);
	if (!result.success) {
		const issue = result.issues[0];
		const path = issue.path?.map((p) => p.key).join('.') ?? '<root>';
		throw new Error(`Invalid history data at '${path}': ${issue.message}`);
	}
	return result.output;
}

/** The M1 history data (loaded once at module init, fail-fast). */
export const history: HistoryData = loadHistory(historyJson);

// ---------------------------------------------------------------------------
// Coal crisis
// ---------------------------------------------------------------------------

/**
 * Fuel price factor for the *settled* year: the crisis multiplies the base
 * fuel price only from its start year on (announced one year earlier in the
 * newspaper; the factor itself comes from economy balance data).
 */
export function crisisFactor(year: number, data: HistoryData = history): number {
	return year >= data.crisis.startYear ? economy.crisisFuelFactor : 1;
}

/** True when the newspaper of `year` carries the crisis telegraph notice. */
export function announcesCrisis(year: number, data: HistoryData = history): boolean {
	return year === data.crisis.announceYear;
}

// ---------------------------------------------------------------------------
// Newspaper
// ---------------------------------------------------------------------------

/** Curated headline for a year (empty string when none is curated). */
export function headlineFor(year: number, data: HistoryData = history): string {
	return data.headlines.find((h) => h.year === year)?.text ?? '';
}

/** Assemble the newspaper for a closed year: headline + year's messages. */
export function assembleNewspaper(
	state: GameState,
	year: number,
	data: HistoryData = history
): Newspaper {
	const messages = state.systems.events.messages.filter((m) => m.year === year);
	return { year, headline: headlineFor(year, data), messages };
}

// ---------------------------------------------------------------------------
// Tram deal
// ---------------------------------------------------------------------------

/** True while the tram contract is running (load + revenue + growth boost). */
export function tramActive(state: GameState): boolean {
	return state.systems.events.tram.phase === 'active';
}

/** Flat tram load (kW) for a region while the contract runs (0 otherwise). */
export function tramLoadForRegion(state: GameState, regionId: string): number {
	return tramActive(state) && regionId === history.tramDeal.regionId
		? history.tramDeal.loadKw
		: 0;
}

/** Player decision on a pending offer (phase offered/reoffered). */
export function decideTram(state: GameState, accept: boolean): void {
	const tram = state.systems.events.tram;
	if (tram.phase !== 'offered' && tram.phase !== 'reoffered') return;
	if (accept) {
		tram.phase = 'active';
		tram.contractStartYear = state.clock.year;
		pushMessage(state, 'Die Straßenbahn schließt den Stromvertrag ab.');
	} else if (tram.phase === 'offered') {
		// Seeded one-shot re-offer roll, decided here and now for replayability.
		const rng = { a: state.rngState };
		const roll = drawFloat(rng);
		state.rngState = rng.a >>> 0;
		tram.reofferGranted = roll < history.tramDeal.reofferProbability;
		if (tram.reofferGranted) {
			tram.phase = 'pending';
			tram.offerYear = state.clock.year + 1; // re-offer in the next year
		} else {
			tram.phase = 'rejectedFinal';
			pushMessage(state, 'Die Straßenbahn bricht die Verhandlungen ab.');
		}
	} else {
		tram.phase = 'rejectedFinal';
		pushMessage(state, 'Die Straßenbahn bricht die Verhandlungen ab.');
	}
}

// ---------------------------------------------------------------------------
// System step
// ---------------------------------------------------------------------------

/**
 * Events step (runs last in the tick, after economy). `settled` is the clock
 * of the quarter that was just settled (before the tick advanced it):
 * - presents the tram offer (initial in the offer year, re-offer in its due year)
 * - closes an expired contract
 * - assembles the newspaper when a year closes (settled Q4), carrying the
 *   crisis telegraph notice in the announce year
 */
export function runEvents(
	state: GameState,
	settled: { year: number; quarter: number },
	data: HistoryData = history
): void {
	const events = state.systems.events;
	const tram = events.tram;
	const deal = data.tramDeal;
	const year = state.clock.year;

	// Tram lifecycle
	if (tram.phase === 'pending') {
		const dueYear = tram.reofferGranted ? tram.offerYear : deal.offerYear;
		if (year >= dueYear && regionUnlocked(deal.regionId)) {
			tram.phase = tram.reofferGranted ? 'reoffered' : 'offered';
			tram.tariffShare = tram.reofferGranted ? deal.reofferTariffShare : deal.tariffShare;
			tram.offerYear = year;
		}
	}
	if (tram.phase === 'active' && tram.contractStartYear !== null) {
		if (year - tram.contractStartYear >= deal.durationYears) {
			tram.phase = 'closed';
			pushMessage(state, 'Der Straßenbahn-Vertrag ist ausgelaufen.');
		}
	}

	// Newspaper when the settled quarter closed the year. Only years with
	// actual content get a paper (spec: tune-newspaper-presentation):
	// a curated headline or at least one game message of that year.
	if (settled.quarter === 4) {
		if (announcesCrisis(settled.year, data)) {
			events.messages.push({
				year: settled.year,
				quarter: 4,
				text: 'Telegraph: Unruhe im Kohlebergbau. Höhere Brennstoffpreise zeichnen sich ab.'
			});
		}
		const hasContent =
			headlineFor(settled.year, data) !== '' ||
			events.messages.some((m) => m.year === settled.year);
		if (hasContent) {
			events.newspapers.push(assembleNewspaper(state, settled.year, data));
		}
	}
}

function regionUnlocked(regionId: string): boolean {
	return province.regions.some((r) => r.id === regionId && r.unlocked);
}

/** Append a game message stamped with the current clock. */
export function pushMessage(state: GameState, text: string): void {
	state.systems.events.messages.push({
		year: state.clock.year,
		quarter: state.clock.quarter,
		text
	});
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/** Initial events state: no newspapers, no messages, tram deal pending. */
export function initEvents(): EventsState {
	return {
		newspapers: [],
		messages: [],
		tram: {
			phase: 'pending',
			offerYear: 0,
			tariffShare: history.tramDeal.tariffShare,
			contractStartYear: null,
			reofferGranted: false
		}
	};
}
