export type TransactionItemInput = {
  itemType: 'product' | 'service';
  itemId: string;
  itemName: string;
  price: number;
  qty: number;
  petId?: string;
};

export function calculateTransactionTotals(items: TransactionItemInput[], discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const safeDiscount = Math.max(0, discount);
  const total = Math.max(0, subtotal - safeDiscount);
  return { subtotal, discount: safeDiscount, total };
}

export function createTransactionSnapshot(items: TransactionItemInput[]) {
  return items.map((item) => ({
    ...item,
    lineTotal: item.price * item.qty,
    priceAtTransaction: item.price,
  }));
}

export function applyStockDelta(stockQty: number, qty: number, direction: 'increase' | 'decrease') {
  const delta = direction === 'decrease' ? -qty : qty;
  return stockQty + delta;
}
