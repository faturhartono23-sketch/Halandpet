import { Fragment } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function TransactionsListPage() {
  const supabase = getSupabaseClient();
  let transactions: Array<{ id: string; customer_id: string | null; transaction_number: string; total: number; status: string; payment_status: string; created_at: string }> = [];
  let customers: Array<{ id: string; full_name: string }> = [];
  let itemsByTransaction: Record<string, Array<{ item_name_snapshot: string; qty: number; line_total: number; item_type: string }>> = {};

  if (supabase) {
    const [{ data: transactionData, error: transactionError }, { data: customerData, error: customerError }, { data: itemData, error: itemError }] = await Promise.all([
      supabase.from('transactions').select('id, customer_id, transaction_number, total, status, payment_status, created_at').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, full_name').order('created_at', { ascending: false }),
      supabase.from('transaction_items').select('transaction_id, item_name_snapshot, qty, line_total, item_type').order('created_at', { ascending: false }),
    ]);

    if (!transactionError) {
      transactions = transactionData ?? [];
    }
    if (!customerError) {
      customers = customerData ?? [];
    }
    if (!itemError) {
      itemData?.forEach((item) => {
        itemsByTransaction[item.transaction_id] = [...(itemsByTransaction[item.transaction_id] ?? []), item];
      });
    }
  }

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer.full_name]));

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">POS</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Riwayat Transaksi</h1>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Nomor</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Belum ada transaksi tersimpan. Transaksi pertama Anda akan muncul di sini.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <Fragment key={transaction.id}>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900">{transaction.transaction_number}</td>
                      <td className="px-4 py-3 text-slate-700">{customerLookup.get(transaction.customer_id ?? '') ?? 'Walk-in'}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">Rp {Number(transaction.total).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3">{transaction.status}</td>
                      <td className="px-4 py-3">{transaction.payment_status}</td>
                    </tr>
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-slate-50">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-900">Rincian item</p>
                            <Link href={`/pos/checkout`} className="text-sm text-teal-600">Lihat checkout</Link>
                          </div>
                          {(itemsByTransaction[transaction.id] ?? []).length === 0 ? (
                            <p className="mt-2 text-sm text-slate-600">Tidak ada rincian item untuk transaksi ini.</p>
                          ) : (
                            <ul className="mt-3 space-y-2">
                              {(itemsByTransaction[transaction.id] ?? []).map((item, index) => (
                                <li key={`${transaction.id}-${index}`} className="flex items-center justify-between text-sm text-slate-600">
                                  <span>{item.item_name_snapshot} ({item.item_type})</span>
                                  <span>{item.qty} x Rp {Number(item.line_total).toLocaleString('id-ID')}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
