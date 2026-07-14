"use server";

import { redirect } from 'next/navigation';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';
import { getSupabaseClient } from '@/lib/supabase/client';
import { adjustStockQuantity } from '@/lib/domain/products/stock';
import { buildTransactionPayload } from '@/lib/domain/transactions/checkout';

export async function createTransaction(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id || (profile.role !== 'owner' && profile.role !== 'staff')) {
    throw new Error('Only owner or staff can create transactions');
  }

  const items: Array<{ itemType: 'product' | 'service'; itemId: string; itemName: string; priceAtTransaction: number; qty: number; petId?: string }> = [];
  formData.forEach((value, key) => {
    if (key.startsWith('itemId-')) {
      const index = key.split('-')[1];
      const itemId = String(value);
      const itemType = String(formData.get(`itemType-${index}`) || 'product') as 'product' | 'service';
      const itemName = String(formData.get(`itemName-${index}`) || 'Produk');
      const priceAtTransaction = Number(formData.get(`price-${index}`) || 0);
      const qty = Number(formData.get(`qty-${index}`) || 1);
      const petId = String(formData.get(`petId-${index}`) || '').trim() || undefined;
      items.push({ itemType, itemId, itemName, priceAtTransaction, qty, petId });
    }
  });

  const draft = {
    items: items.length > 0 ? items : [
      {
        itemType: 'product' as const,
        itemId: String(formData.get('itemId') || 'p1'),
        itemName: String(formData.get('itemName') || 'Produk'),
        priceAtTransaction: Number(formData.get('price') || 0),
        qty: Number(formData.get('qty') || 1),
      },
    ],
    customerId: String(formData.get('customerId') || '').trim() || null,
    customerName: String(formData.get('customerName') || ''),
    paymentMethod: String(formData.get('paymentMethod') || 'cash') as 'cash' | 'transfer' | 'other',
  };

  const payload = buildTransactionPayload(draft);
  const { data: transaction, error: transactionError } = await supabase.from('transactions').insert({
    transaction_number: payload.transaction_number,
    customer_id: payload.customer_id,
    subtotal: payload.subtotal,
    discount: payload.discount,
    total: payload.total,
    payment_method: payload.payment_method,
    payment_status: payload.payment_status,
    status: payload.status,
    cashier_id: profile.id,
  }).select('id').single();

  if (transactionError || !transaction) {
    throw new Error(transactionError?.message || 'Unable to create transaction');
  }

  const { error: itemsError } = await supabase.from('transaction_items').insert(
    payload.items.map((item) => ({
      transaction_id: transaction.id,
      item_type: item.item_type,
      item_id: item.item_id,
      item_name_snapshot: item.item_name_snapshot,
      price_at_transaction: item.price_at_transaction,
      qty: item.qty,
      line_total: item.line_total,
      pet_id: item.pet_id,
    }))
  );

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  for (const item of payload.items) {
    if (item.item_type !== 'product') {
      continue;
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock_qty')
      .eq('id', item.item_id)
      .single();

    if (productError || !product) {
      throw new Error(productError?.message || 'Unable to find product stock');
    }

    const nextStock = adjustStockQuantity(Number(product.stock_qty), -Number(item.qty));
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock_qty: nextStock, updated_at: new Date().toISOString() })
      .eq('id', item.item_id);

    if (stockError) {
      throw new Error(stockError.message);
    }
  }

  redirect('/pos/checkout');
}
