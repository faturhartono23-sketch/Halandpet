import { getSupabaseClient } from '@/lib/supabase/client';

export default async function TransactionsListPage() {
  const supabase = getSupabaseClient();
  let transactions: Array<{ id: string; transaction_number: string; total: number; status: string; payment_status: string }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('transactions').select('id, transaction_number, total, status, payment_status').order('created_at', { ascending: false });
    if (!error) {
      transactions = data ?? [];
    }
  }

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
                <th className="px-4 py-3 text-left font-medium text-slate-700">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    Belum ada transaksi tersimpan.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{transaction.transaction_number}</td>
                    <td className="px-4 py-3">Rp {Number(transaction.total).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{transaction.status}</td>
                    <td className="px-4 py-3">{transaction.payment_status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
