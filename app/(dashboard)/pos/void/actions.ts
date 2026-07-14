"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ensureProfileForCurrentUser } from '@/lib/domain/auth/profile';
import { buildVoidTransactionPayload, canVoidTransaction } from '@/lib/domain/pos/transaction';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function voidTransaction(formData: FormData) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    redirect('/login');
  }

  const profile = await ensureProfileForCurrentUser(supabase as never);
  if (!profile?.id) {
    throw new Error('Unable to determine current user profile');
  }

  const transactionNumber = String(formData.get('transactionNumber') || '').trim();
  const reason = String(formData.get('reason') || '').trim();

  if (!transactionNumber) {
    throw new Error('Transaction number is required');
  }

  if (!reason) {
    throw new Error('A void reason is required');
  }

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .select('id, status')
    .eq('transaction_number', transactionNumber)
    .single();

  if (transactionError || !transaction) {
    throw new Error(transactionError?.message || 'Transaction not found');
  }

  if (!canVoidTransaction(profile.role, transaction.status)) {
    throw new Error('Only owner can void a completed transaction');
  }

  const payload = buildVoidTransactionPayload(reason, profile.id);
  const { error: updateError } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', transaction.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath('/pos/list');
  redirect('/pos/list');
}
