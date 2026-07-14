"use server";

import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { normalizeProductInput } from '@/lib/domain/products/product';

export async function createProduct(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const payload = normalizeProductInput({
    name: String(formData.get('name') || ''),
    sku: String(formData.get('sku') || ''),
    price: Number(formData.get('price') || 0),
    costPrice: Number(formData.get('costPrice') || 0),
    stockQty: Number(formData.get('stockQty') || 0),
    unit: String(formData.get('unit') || 'pcs'),
    minStockAlert: Number(formData.get('minStockAlert') || 5),
    isActive: true,
  });

  if (payload.stock_qty < 0) {
    throw new Error('Stock cannot be negative');
  }

  const { error } = await supabase.from('products').insert(payload);
  if (error) {
    throw new Error(error.message);
  }

  redirect('/products');
}
