import { describe, expect, it } from 'vitest';
import { normalizeProductInput } from './product';

describe('product normalization', () => {
  it('normalizes a product payload for persistence', () => {
    const normalized = normalizeProductInput({
      name: '  Whiskas  ',
      categoryId: 'cat-1',
      sku: ' WS-001 ',
      price: 42000,
      costPrice: 32000,
      stockQty: 10,
      unit: 'pcs',
      minStockAlert: 3,
      isActive: true,
    });

    expect(normalized).toEqual({
      name: 'Whiskas',
      category_id: 'cat-1',
      sku: 'WS-001',
      price: 42000,
      cost_price: 32000,
      stock_qty: 10,
      unit: 'pcs',
      min_stock_alert: 3,
      is_active: true,
    });
  });
});
