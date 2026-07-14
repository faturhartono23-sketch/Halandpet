"use server";

import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!email || !password) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect('/login');
  }

  redirect('/dashboard');
}
