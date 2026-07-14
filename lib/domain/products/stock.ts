export type StockAlertStatus = 'ok' | 'low' | 'critical';

export function adjustStockQuantity(currentStock: number, delta: number) {
  const nextStock = currentStock + delta;
  if (nextStock < 0) {
    throw new Error('Insufficient stock');
  }

  return nextStock;
}

export function getStockAlertStatus(stockQty: number, minStockAlert = 5): StockAlertStatus {
  if (stockQty <= 0) {
    return 'critical';
  }

  if (stockQty <= minStockAlert) {
    return 'low';
  }

  return 'ok';
}
