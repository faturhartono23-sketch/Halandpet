import { describe, expect, it } from 'vitest';
import { buildTransactionNumber, buildTransactionPayload } from './checkout';

describe('checkout helpers', () => {
  it('builds a transaction number in the expected format', () => {
    const value = buildTransactionNumber('INV');
    expect(value).toMatch(/^INV-\d{8}-\d{4}$/);
  });

  it('builds a payload with snapshot prices and line totals', () => {
    const payload = buildTransactionPayload({
      items: [
        { itemType: 'product', itemId: 'p1', itemName: 'Whiskas', priceAtTransaction: 45000, qty: 2 },
      ],
      paymentMethod: 'cash',
      customerName: 'Budi',
    });

    expect(payload.total).toBe(90000);
    expect(payload.items[0].price_at_transaction).toBe(45000);
    expect(payload.items[0].line_total).toBe(90000);
  });
});
