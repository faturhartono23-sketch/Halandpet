import { describe, expect, it } from 'vitest';
import { buildPriceHistorySnapshot, formatPrice } from './price-history';

describe('price history helpers', () => {
  it('formats prices in Indonesian format', () => {
    expect(formatPrice(120000)).toBe('Rp 120.000');
  });

  it('builds a snapshot with delta values', () => {
    const snapshot = buildPriceHistorySnapshot([
      { id: '1', itemType: 'product', itemId: 'p1', oldPrice: 50000, newPrice: 60000, changedBy: 'owner', changedAt: '2026-01-01' },
    ]);

    expect(snapshot[0].delta).toBe(10000);
  });
});
