"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { normalizeProductInput } from '@/lib/domain/products/product';
import { adjustStockQuantity } from '@/lib/domain/products/stock';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';

export async function createProduct(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id) {
    throw new Error('Unable to determine current user profile');
  }

  const isOwner = profile.role === 'owner';
  const isStaff = profile.role === 'staff';
  if (!isOwner && !isStaff) {
    throw new Error('Only owner or staff can manage products');
  }

  const payload = normalizeProductInput({
    name: String(formData.get('name') || ''),
    sku: String(formData.get('sku') || ''),
    price: isOwner ? Number(formData.get('price') || 0) : 0,
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

  revalidatePath('/products');
  redirect('/products');
}

export async function createCategory(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id || profile.role !== 'owner') {
    throw new Error('Only owner can manage product categories');
  }

  const name = String(formData.get('name') || '').trim();
  if (!name) {
    throw new Error('Category name is required');
  }

  const { error } = await supabase.from('product_categories').insert({ name });
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/products');
  redirect('/products');
}

export async function adjustStock(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id || (profile.role !== 'owner' && profile.role !== 'staff')) {
    throw new Error('Only owner or staff can adjust stock');
  }

  const productId = String(formData.get('productId') || '').trim();
  const delta = Number(formData.get('delta') || 0);
  const reason = String(formData.get('reason') || 'Penyesuaian').trim();

  if (!productId) {
    throw new Error('Product is required');
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, stock_qty')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    throw new Error(productError?.message || 'Unable to find product');
  }

  const nextStock = adjustStockQuantity(Number(product.stock_qty), delta);
  const { error: updateError } = await supabase
    .from('products')
    .update({ stock_qty: nextStock, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath('/products');
  redirect(`/products?stock-adjusted=${encodeURIComponent(reason)}`);
}
