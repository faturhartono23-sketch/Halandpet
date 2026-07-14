"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function createVisit(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id || (profile.role !== 'owner' && profile.role !== 'dokter')) {
    throw new Error('Only owner or doctors can create visits');
  }

  const petId = String(formData.get('petId') || '').trim();
  if (!petId) {
    throw new Error('A visit must be linked to a pet');
  }

  const { error } = await supabase.from('visits').insert({
    pet_id: petId,
    handled_by: profile.id,
    visit_type: String(formData.get('visitType') || 'checkup'),
    diagnosis: String(formData.get('diagnosis') || ''),
    treatment_notes: String(formData.get('treatmentNotes') || ''),
    weight_kg: Number(formData.get('weightKg') || 0),
    next_visit_recommendation: String(formData.get('nextVisitRecommendation') || ''),
    status: String(formData.get('status') || 'completed'),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/clinic/visits');
  redirect('/clinic/visits');
}
