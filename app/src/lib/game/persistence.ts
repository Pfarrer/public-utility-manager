/**
 * localStorage persistence for the M1 game state: single save slot,
 * version-guarded (reject, don't migrate), injectable storage so unit
 * tests run in plain node without any DOM.
 */
import type { GameState } from './types';

/** Bump on breaking state changes; v3 saves migrate to v4 (add-three-phase-power). */
export const SAVE_VERSION = 4; // v4: tariff pair, shares per current type, dcAcceptingNew
export const SAVE_KEY = 'pum-save-v1';

interface SaveFile {
	version: number;
	state: GameState;
}

/**
 * Deterministic v3 → v4 migration (change: add-three-phase-power, D5):
 * every generator is treated as DC (no component change needed — the catalog
 * default is 'dc'), the single tariff becomes both the DC and AC tariff,
 * every segment share becomes `{ dc: oldShare, ac: 0 }`, and
 * `dcAcceptingNew` defaults to true.
 */
export function migrateSave(raw: SaveFile): SaveFile {
	if (raw.version === 3) {
		const state = raw.state as unknown as {
			systems: {
				economy: { tariff: number | { dc: number; ac: number }; dcAcceptingNew?: boolean };
				growth: { shares: Record<string, Record<string, number | { dc: number; ac: number }>> };
			};
		};
		const oldTariff =
			typeof state.systems.economy.tariff === 'number' ? state.systems.economy.tariff : 0.3;
		state.systems.economy.tariff = { dc: oldTariff, ac: oldTariff };
		state.systems.economy.dcAcceptingNew = true;
		for (const settlementId of Object.keys(state.systems.growth.shares)) {
			const segments = state.systems.growth.shares[settlementId];
			for (const cat of Object.keys(segments)) {
				const old = segments[cat];
				segments[cat] =
					typeof old === 'number' ? { dc: old, ac: 0 } : { dc: old.dc, ac: old.ac };
			}
		}
		return { version: 4, state: raw.state };
	}
	return raw;
}

/** localStorage in the browser; null anywhere else (node, sandboxed frames). */
function defaultStorage(): Storage | null {
	try {
		if (typeof localStorage !== 'undefined') return localStorage;
	} catch {
		// access can throw in restricted contexts (privacy mode, sandboxed iframe)
	}
	return null;
}

/** Minimal in-memory Storage — reference implementation for tests. */
export class MemoryStorage implements Storage {
	private data = new Map<string, string>();

	get length(): number {
		return this.data.size;
	}
	clear(): void {
		this.data.clear();
	}
	getItem(key: string): string | null {
		return this.data.has(key) ? this.data.get(key)! : null;
	}
	key(index: number): string | null {
		return [...this.data.keys()][index] ?? null;
	}
	removeItem(key: string): void {
		this.data.delete(key);
	}
	setItem(key: string, value: string): void {
		this.data.set(key, String(value));
	}
}

/** Serialize the whole state under the save key. Returns false without storage. */
export function saveGame(state: GameState, storage: Storage | null = defaultStorage()): boolean {
	if (!storage) return false;
	const file: SaveFile = { version: SAVE_VERSION, state };
	try {
		storage.setItem(SAVE_KEY, JSON.stringify(file));
		return true;
	} catch {
		// quota or disabled storage — persistence is best-effort in M1
		return false;
	}
}

/** Load and validate. Throws on missing, corrupt or version-mismatched saves. */
export function loadGame(storage: Storage | null = defaultStorage()): GameState {
	const raw = storage?.getItem(SAVE_KEY);
	if (raw == null) throw new Error(`No save present under "${SAVE_KEY}"`);
	let parsed: SaveFile;
	try {
		parsed = JSON.parse(raw) as SaveFile;
	} catch {
		throw new Error(`Corrupt save data under "${SAVE_KEY}" — not valid JSON`);
	}
	if (parsed?.version !== SAVE_VERSION) {
		if (parsed?.version === 3) {
			parsed = migrateSave(parsed);
		} else {
			throw new Error(
				`Save version mismatch: save is v${String(parsed?.version)}, build expects v${SAVE_VERSION} — save rejected`
			);
		}
	}
	return parsed.state;
}

/** Whether a save slot exists. Never throws. */
export function hasSave(storage: Storage | null = defaultStorage()): boolean {
	try {
		return storage?.getItem(SAVE_KEY) != null;
	} catch {
		return false;
	}
}

/** Remove the save slot. Never throws. */
export function clearSave(storage: Storage | null = defaultStorage()): void {
	try {
		storage?.removeItem(SAVE_KEY);
	} catch {
		// no-op
	}
}
