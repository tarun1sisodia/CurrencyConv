import { describe, expect, it } from 'vitest';
import { calculateConversion, formatCurrency, parseAmount, sanitizeAmountInput } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats USD with grouping and two decimals', () => {
    expect(formatCurrency(1234567.89, 'USD')).toBe('$1,234,567.89');
  });
});

describe('calculateConversion', () => {
  it('multiplies amount by rate to two decimals', () => {
    expect(calculateConversion(100, 1.08)).toBe(108.0);
  });
});

describe('sanitizeAmountInput', () => {
  it('rejects letters and extra decimals', () => {
    expect(sanitizeAmountInput('12a3.4.5')).toBe('123.45');
  });
});

describe('parseAmount', () => {
  it('returns 0 for empty input', () => {
    expect(parseAmount('')).toBe(0);
  });
});
