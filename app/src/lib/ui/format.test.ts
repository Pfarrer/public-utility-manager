import { describe, expect, it } from 'vitest';
import { money, unit } from './format';

describe('money', () => {
	it('formats positive amounts with German grouping', () => {
		expect(money(50000)).toBe('50.000\u00A0$');
	});

	it('formats negative amounts with a minus sign', () => {
		expect(money(-5500)).toBe('-5.500\u00A0$');
	});

	it('never uses a breakable space before the currency', () => {
		expect(money(1234)).not.toContain(' $');
	});
});

describe('unit', () => {
	it('joins value and unit with a non-breaking space', () => {
		expect(unit(80, 'kW')).toBe('80\u00A0kW');
	});

	it('passes through string values', () => {
		expect(unit('12 / 40', 'kW')).toBe('12 / 40\u00A0kW');
	});
});
