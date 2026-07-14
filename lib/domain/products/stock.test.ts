import { describe, expect, it } from 'vitest';
import { adjustStockQuantity, getStockAlertStatus } from './stock';

describe('stock helpers', () => {
  it('reduces stock safely when quantity is available', () => {
    expect(adjustStockQuantity(12, -3)).toBe(9);
  });

  it('throws when stock would go below zero', () => {
    expect(() => adjustStockQuantity(2, -3)).toThrow('Insufficient stock');
  });

  it('returns low-stock status based on minimum threshold', () => {
    expect(getStockAlertStatus(4, 5)).toBe('low');
    expect(getStockAlertStatus(6, 5)).toBe('ok');
    expect(getStockAlertStatus(0, 5)).toBe('critical');
  });
});
