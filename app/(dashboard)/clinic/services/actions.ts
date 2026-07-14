"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizeServiceInput } from '@/lib/domain/services/service';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function createService(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const payload = normalizeServiceInput({
    name: String(formData.get('name') || ''),
    description: String(formData.get('description') || ''),
    price: Number(formData.get('price') || 0),
    durationMinutes: Number(formData.get('durationMinutes') || 0),
    isActive: true,
  });

  const { error } = await supabase.from('services').insert(payload);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/clinic/services');
  revalidatePath('/clinic/services/list');
  redirect('/clinic/services/list');
}
