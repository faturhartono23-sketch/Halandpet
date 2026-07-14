export type PriceUpdatePayload = {
  itemType: 'product' | 'service';
  itemId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
};

export function normalizePriceUpdateInput(input: {
  itemType: string;
  itemId: string;
  oldPrice: string | number;
  newPrice: string | number;
  changedBy: string;
}): PriceUpdatePayload {
  const normalizedItemType = input.itemType === 'service' ? 'service' : 'product';
  const normalizedItemId = input.itemId.trim();

  if (!normalizedItemId) {
    throw new Error('Item id is required');
  }

  const oldPrice = Number(input.oldPrice);
  const newPrice = Number(input.newPrice);

  if (oldPrice < 0 || newPrice < 0) {
    throw new Error('Price cannot be negative');
  }

  return {
    itemType: normalizedItemType,
    itemId: normalizedItemId,
    oldPrice,
    newPrice,
    changedBy: input.changedBy.trim() || 'owner',
  };
}
