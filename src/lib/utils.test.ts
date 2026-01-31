import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatCurrency } from './utils';

describe('cn (className utility)', () => {
  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional')).toBe('base-class conditional');
    expect(cn('base-class', false && 'conditional')).toBe('base-class');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, 'class', null)).toBe('base class');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15');
    const formatted = formatDate(date, 'en-US');
    expect(formatted).toContain('2024');
  });

  it('should handle string date input', () => {
    const formatted = formatDate('2024-01-15', 'en-US');
    expect(formatted).toContain('2024');
  });
});

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD', 'en-US')).toBe('$1,234.56');
  });

  it('should format EUR correctly', () => {
    const formatted = formatCurrency(1234.56, 'EUR', 'de-DE');
    expect(formatted).toContain('1.234');
    expect(formatted).toContain('€');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00');
  });
});
