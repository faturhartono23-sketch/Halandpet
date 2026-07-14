"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizeCustomerInput } from '@/lib/domain/customers/customer';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function createCustomer(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id) {
    throw new Error('Unable to determine current user profile');
  }

  const payload = normalizeCustomerInput({
    fullName: String(formData.get('fullName') || ''),
    phone: String(formData.get('phone') || ''),
    address: String(formData.get('address') || ''),
  });

  const { error } = await supabase.from('customers').insert({
    ...payload,
    created_by: profile.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/customers');
  redirect('/customers');
}
