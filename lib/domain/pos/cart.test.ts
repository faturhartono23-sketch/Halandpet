import { describe, expect, it } from 'vitest';
import { calculateCartSubtotal, calculateCartTotal } from './cart';

describe('cart calculations', () => {
  it('calculates subtotal from cart lines', () => {
    const lines = [
      { id: '1', itemType: 'product' as const, itemId: 'p1', itemName: 'Whiskas', price: 40000, qty: 2 },
      { id: '2', itemType: 'service' as const, itemId: 's1', itemName: 'Konsultasi', price: 120000, qty: 1 },
    ];

    expect(calculateCartSubtotal(lines)).toBe(200000);
  });

  it('applies discount correctly', () => {
    const lines = [{ id: '1', itemType: 'product' as const, itemId: 'p1', itemName: 'Whiskas', price: 40000, qty: 2 }];
    expect(calculateCartTotal(lines, 10000)).toBe(70000);
  });
});
