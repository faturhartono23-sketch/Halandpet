export type CheckoutDraft = {
  items: Array<{
    itemType: 'product' | 'service';
    itemId: string;
    itemName: string;
    priceAtTransaction: number;
    qty: number;
    petId?: string;
  }>;
  customerId?: string | null;
  customerName?: string;
  paymentMethod: 'cash' | 'transfer' | 'other';
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
};

export function buildTransactionNumber(prefix = 'INV') {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${datePart}-${randomPart}`;
}

export function buildTransactionPayload(draft: CheckoutDraft) {
  const hasServiceWithoutPet = draft.items.some((item) => item.itemType === 'service' && !item.petId);
  if (hasServiceWithoutPet) {
    throw new Error('Service items require a pet linkage');
  }

  const subtotal = draft.items.reduce((sum, item) => sum + item.priceAtTransaction * item.qty, 0);
  return {
    transaction_number: buildTransactionNumber(),
    subtotal,
    discount: 0,
    total: subtotal,
    payment_method: draft.paymentMethod,
    payment_status: draft.paymentStatus ?? 'paid',
    status: 'completed',
    customer_id: draft.customerId ?? null,
    customer_name_snapshot: draft.customerName?.trim() || null,
    items: draft.items.map((item) => ({
      item_type: item.itemType,
      item_id: item.itemId,
      item_name_snapshot: item.itemName,
      price_at_transaction: item.priceAtTransaction,
      qty: item.qty,
      pet_id: item.petId ?? null,
      line_total: item.priceAtTransaction * item.qty,
    })),
  };
}
