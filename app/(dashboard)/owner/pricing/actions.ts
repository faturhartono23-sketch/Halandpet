"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { normalizePriceUpdateInput } from '@/lib/domain/pricing/price-update';

export async function updatePrice(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const payload = normalizePriceUpdateInput({
    itemType: String(formData.get('itemType') || 'product'),
    itemId: String(formData.get('itemId') || ''),
    oldPrice: String(formData.get('oldPrice') || '0'),
    newPrice: String(formData.get('newPrice') || '0'),
    changedBy: String(formData.get('changedBy') || 'owner'),
  });

  const { error: historyError } = await supabase.from('price_history').insert({
    item_type: payload.itemType,
    item_id: payload.itemId,
    old_price: payload.oldPrice,
    new_price: payload.newPrice,
    changed_by: payload.changedBy,
  });

  if (historyError) {
    throw new Error(historyError.message);
  }

  const table = payload.itemType === 'service' ? 'services' : 'products';
  const { error: updateError } = await supabase.from(table).update({ price: payload.newPrice, updated_at: new Date().toISOString() }).eq('id', payload.itemId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath('/owner/pricing');
  revalidatePath('/products');
  revalidatePath('/clinic/services');
  redirect('/owner/pricing');
}
