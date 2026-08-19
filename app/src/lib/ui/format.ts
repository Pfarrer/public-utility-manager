/**
 * UI formatting helpers. Centralised so every money surface renders the
 * same grouping and, critically, binds value and currency with a
 * non-breaking space (U+00A0) — no line can break between amount and $.
 */

/** Format an amount as German-locale currency with a non-breaking `$`. */
export function money(value: number): string {
	return value.toLocaleString('de-DE') + '\u00A0$';
}

/** Join a numeric value and a unit with a non-breaking space. */
export function unit(value: number | string, suffix: string): string {
	return `${value}\u00A0${suffix}`;
}
