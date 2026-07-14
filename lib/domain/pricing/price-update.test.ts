import { describe, expect, it } from 'vitest';
import { normalizePriceUpdateInput } from './price-update';

describe('normalizePriceUpdateInput', () => {
  it('normalizes a valid price update payload', () => {
    const result = normalizePriceUpdateInput({
      itemType: 'product',
      itemId: ' 123 ',
      oldPrice: '15000',
      newPrice: '18000',
      changedBy: 'owner',
    });

    expect(result).toEqual({
      itemType: 'product',
      itemId: '123',
      oldPrice: 15000,
      newPrice: 18000,
      changedBy: 'owner',
    });
  });

  it('rejects negative prices', () => {
    expect(() =>
      normalizePriceUpdateInput({
        itemType: 'service',
        itemId: 'svc-1',
        oldPrice: '0',
        newPrice: '-100',
        changedBy: 'owner',
      })
    ).toThrow('Price cannot be negative');
  });

  it('rejects empty item ids', () => {
    expect(() =>
      normalizePriceUpdateInput({
        itemType: 'product',
        itemId: '   ',
        oldPrice: '0',
        newPrice: '100',
        changedBy: 'owner',
      })
    ).toThrow('Item id is required');
  });
});
