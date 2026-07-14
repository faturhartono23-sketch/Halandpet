export type PriceHistoryEntry = {
  id: string;
  itemType: 'product' | 'service';
  itemId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
};

export function formatPrice(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function buildPriceHistorySnapshot(entries: PriceHistoryEntry[]) {
  return entries.map((entry) => ({
    ...entry,
    delta: entry.newPrice - entry.oldPrice,
  }));
}
