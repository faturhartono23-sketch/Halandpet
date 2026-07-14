export type CartLine = {
  id: string;
  itemType: 'product' | 'service';
  itemId: string;
  itemName: string;
  price: number;
  qty: number;
  petId?: string;
};

export function calculateCartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0);
}

export function calculateCartTotal(lines: CartLine[], discount = 0) {
  const subtotal = calculateCartSubtotal(lines);
  const safeDiscount = Math.max(0, discount);
  return Math.max(0, subtotal - safeDiscount);
}
