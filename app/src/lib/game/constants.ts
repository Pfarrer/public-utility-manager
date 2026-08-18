/** Game-wide constants for the simulation core (framework-free). */
export const GAME_TITLE = 'Public Utility Manager';

/** Starting capital for a new game (not covered by a spec — M1 pragmatic default). */
export const START_CASH = 50_000;

/**
 * Days billed per quarter. Dispatch simulates one representative 24-h day;
 * quarterly energy (and thus revenue/fuel in the economy) is that day's
 * energy × QUARTER_DAYS. Wages are booked per quarter directly.
 */
export const QUARTER_DAYS = 91;
