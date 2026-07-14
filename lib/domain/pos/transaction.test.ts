import { describe, expect, it } from 'vitest';
import { applyStockDelta, buildVoidTransactionPayload, calculateTransactionTotals, canVoidTransaction, createTransactionSnapshot } from './transaction';

describe('transaction domain logic', () => {
  it('calculates subtotal, discount, and total correctly', () => {
    const items = [
      { itemType: 'product' as const, itemId: 'p1', itemName: 'Food', price: 25000, qty: 2 },
      { itemType: 'service' as const, itemId: 's1', itemName: 'Checkup', price: 120000, qty: 1 },
    ];

    const totals = calculateTransactionTotals(items, 15000);

    expect(totals).toEqual({ subtotal: 170000, discount: 15000, total: 155000 });
  });

  it('preserves price snapshot in transaction items', () => {
    const items = [{ itemType: 'product' as const, itemId: 'p1', itemName: 'Food', price: 50000, qty: 1 }];

    const snapshot = createTransactionSnapshot(items);

    expect(snapshot[0]).toMatchObject({
      priceAtTransaction: 50000,
      lineTotal: 50000,
    });
  });

  it('adjusts stock in the expected direction', () => {
    expect(applyStockDelta(10, 2, 'decrease')).toBe(8);
    expect(applyStockDelta(8, 3, 'increase')).toBe(11);
  });

  it('allows only owner to void an active transaction', () => {
    expect(canVoidTransaction('owner', 'completed')).toBe(true);
    expect(canVoidTransaction('staff', 'completed')).toBe(false);
    expect(canVoidTransaction('owner', 'void')).toBe(false);
  });

  it('builds a void payload with reason and actor metadata', () => {
    const payload = buildVoidTransactionPayload('Kesalahan input', 'profile-1');

    expect(payload).toEqual({
      status: 'void',
      voided_by: 'profile-1',
      voided_reason: 'Kesalahan input',
    });
  });
});
