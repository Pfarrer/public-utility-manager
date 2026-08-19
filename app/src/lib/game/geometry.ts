/** Settlement display geometry — polygon growth stages, deterministic plant anchors (change: add-city-view). */

/** One polygon growth stage: active from `minHouseholds` onward. */
export interface StageRing {
	minHouseholds: number;
	/** Closed SVG path ("M x,y L … Z") in the shared 0–1000 view box. */
	ring: string;
}

/** Display geometry of a settlement — purely presentational, derived at render time. */
export interface SettlementGeometry {
	stages: StageRing[];
}

export interface Vertex {
	x: number;
	y: number;
}

// ---------------------------------------------------------------------------
// Ring parsing + measures (module cache — rings are immutable scenario data)
// ---------------------------------------------------------------------------

/**
 * Parse a closed ring path of the form "M x,y L x,y … Z" into vertices.
 * Throws on malformed input (used at load time, fail-fast).
 */
export function parseRing(ring: string): Vertex[] {
	if (!/Z\s*$/.test(ring)) {
		throw new Error(`Malformed ring path (must end with Z): '${ring.slice(0, 48)}'`);
	}
	const vertices: Vertex[] = [];
	const re = /[ML]\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(ring)) !== null) {
		vertices.push({ x: Number(m[1]), y: Number(m[2]) });
	}
	if (vertices.length < 3) {
		throw new Error(`Malformed ring path (needs ≥ 3 points): '${ring.slice(0, 48)}'`);
	}
	return vertices;
}

interface RingMeasures {
	verts: Vertex[];
	centroid: Vertex;
	/** Max vertex distance from the centroid (circumscribes a convex ring). */
	maxR: number;
	/** Min centroid-to-edge distance (inscribed circle radius for a convex ring). */
	minR: number;
}

const ringCache = new Map<string, RingMeasures>();

function distancePointToSegment(p: Vertex, a: Vertex, b: Vertex): number {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const lenSq = dx * dx + dy * dy;
	const t = lenSq > 0 ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq)) : 0;
	const cx = a.x + t * dx;
	const cy = a.y + t * dy;
	return Math.hypot(p.x - cx, p.y - cy);
}

function ringMeasures(ring: string): RingMeasures {
	const cached = ringCache.get(ring);
	if (cached) return cached;
	const verts = parseRing(ring);
	const centroid: Vertex = {
		x: verts.reduce((s, v) => s + v.x, 0) / verts.length,
		y: verts.reduce((s, v) => s + v.y, 0) / verts.length
	};
	let maxR = 0;
	let minR = Infinity;
	for (let i = 0; i < verts.length; i++) {
		const a = verts[i];
		const b = verts[(i + 1) % verts.length];
		maxR = Math.max(maxR, Math.hypot(a.x - centroid.x, a.y - centroid.y));
		minR = Math.min(minR, distancePointToSegment(centroid, a, b));
	}
	const measures: RingMeasures = { verts, centroid, maxR, minR: Number.isFinite(minR) ? minR : maxR };
	ringCache.set(ring, measures);
	return measures;
}

/** Centroid of a ring (vertex average — sufficient for convex display rings). */
export function ringCentroid(ring: string): Vertex {
	return ringMeasures(ring).centroid;
}

/** Circumscribing radius around the centroid (illumination extent at share = 1). */
export function ringMaxRadius(ring: string): number {
	return ringMeasures(ring).maxR;
}

// ---------------------------------------------------------------------------
// Load-time validation (fail-fast, names the offending field)
// ---------------------------------------------------------------------------

/**
 * Validate a settlement's geometry against its starting households:
 * - ≥ 1 stage, ring paths parseable
 * - thresholds strictly ascending
 * - first threshold ≤ starting households (stage 1 active at game start)
 * Throws naming the failing rule.
 */
export function validateSettlementGeometry(geometry: SettlementGeometry, startHouseholds: number): void {
	if (geometry.stages.length === 0) {
		throw new Error("Invalid settlement geometry at 'geometry.stages': needs at least one stage");
	}
	for (const stage of geometry.stages) {
		if (stage.ring.length === 0) {
			throw new Error("Invalid settlement geometry at 'geometry.stages[].ring': must not be empty");
		}
		parseRing(stage.ring); // throws on malformed path
	}
	for (let i = 1; i < geometry.stages.length; i++) {
		if (geometry.stages[i].minHouseholds <= geometry.stages[i - 1].minHouseholds) {
			throw new Error(
				`Invalid settlement geometry at 'geometry.stages': thresholds must be strictly ascending (stage ${i + 1})`
			);
		}
	}
	if (geometry.stages[0].minHouseholds > startHouseholds) {
		throw new Error(
			`Invalid settlement geometry at 'geometry.stages[0].minHouseholds': first threshold ${geometry.stages[0].minHouseholds} is above the settlement's starting households (${startHouseholds})`
		);
	}
}

// ---------------------------------------------------------------------------
// Stage selection (pure derivation from current households)
// ---------------------------------------------------------------------------

/**
 * Active stage index: the last stage whose threshold is ≤ households;
 * fallback (below every threshold): the first stage.
 */
export function stageFor(geometry: SettlementGeometry, households: number): number {
	let idx = 0;
	for (let i = 0; i < geometry.stages.length; i++) {
		if (geometry.stages[i].minHouseholds <= households) idx = i;
		else break;
	}
	return idx;
}

// ---------------------------------------------------------------------------
// Deterministic plant placement (no render-time randomness)
// ---------------------------------------------------------------------------

/** FNV-1a 32-bit hash — stable across sessions and tests. */
export function hash32(input: string): number {
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/**
 * Which settlement of a region displays a plant: derived deterministically
 * from the region-plant key, spread evenly over the settlement list.
 */
export function settlementIndexForPlant(settlementCount: number, key: string): number {
	return settlementCount > 0 ? hash32(key) % settlementCount : 0;
}

/**
 * Deterministic display anchor inside a settlement's first-stage ring.
 * Hash-derived angle + distance from the centroid, kept within the inscribed
 * circle so the point lies inside the (convex) ring. Stable across growth:
 * later stages only expand outward, so the anchor stays inside them too.
 */
export function plantAnchor(geometry: SettlementGeometry, key: string): Vertex {
	const base = geometry.stages[0];
	const { centroid, minR } = ringMeasures(base.ring);
	const angle = (hash32(key) / 0x100000000) * Math.PI * 2;
	const factor = 0.25 + 0.55 * (hash32(`${key}#2`) / 0x100000000);
	const r = factor * minR;
	return { x: centroid.x + Math.cos(angle) * r, y: centroid.y + Math.sin(angle) * r };
}
