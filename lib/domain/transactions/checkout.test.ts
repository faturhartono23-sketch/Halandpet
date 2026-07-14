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

  it('propagates customer and pet linkage into the payload', () => {
    const payload = buildTransactionPayload({
      items: [
        { itemType: 'service', itemId: 's1', itemName: 'Konsultasi', priceAtTransaction: 150000, qty: 1, petId: 'pet-1' },
      ],
      customerId: 'customer-1',
      paymentMethod: 'cash',
      customerName: 'Budi',
    });

    expect(payload.customer_id).toBe('customer-1');
    expect(payload.items[0].pet_id).toBe('pet-1');
  });

  it('requires a pet linkage for service items', () => {
    expect(() => buildTransactionPayload({
      items: [
        { itemType: 'service', itemId: 's1', itemName: 'Konsultasi', priceAtTransaction: 150000, qty: 1 },
      ],
      customerId: 'customer-1',
      paymentMethod: 'cash',
      customerName: 'Budi',
    })).toThrow('Service items require a pet linkage');
  });
});
