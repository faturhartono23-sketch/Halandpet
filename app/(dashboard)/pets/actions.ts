"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizePetInput } from '@/lib/domain/pets/pet';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function createPet(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id) {
    throw new Error('Unable to determine current user profile');
  }

  const payload = normalizePetInput({
    customerId: String(formData.get('customerId') || ''),
    name: String(formData.get('name') || ''),
    species: String(formData.get('species') || ''),
    breed: String(formData.get('breed') || ''),
    sex: String(formData.get('sex') || ''),
    birthDate: String(formData.get('birthDate') || ''),
    weightKg: String(formData.get('weightKg') || ''),
    notes: String(formData.get('notes') || ''),
  });

  const { error } = await supabase.from('pets').insert(payload);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/pets');
  redirect('/pets');
}
