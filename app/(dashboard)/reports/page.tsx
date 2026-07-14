import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ReportsPage() {
  const supabase = getSupabaseClient();
  let totals = { transactions: 0, revenue: 0, products: 0, services: 0 };

  if (supabase) {
    const [{ count: transactionCount }, { data: transactionData }, { count: productCount }, { count: serviceCount }] = await Promise.all([
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('total'),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    totals.transactions = transactionCount ?? 0;
    totals.revenue = (transactionData ?? []).reduce((sum, row) => sum + Number(row.total ?? 0), 0);
    totals.products = productCount ?? 0;
    totals.services = serviceCount ?? 0;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Reports</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Laporan Penjualan & Operasional</h1>
        <p className="mt-3 text-sm text-slate-600">Ringkasan data transaksi, penjualan, dan inventaris dari satu sumber data.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Jumlah transaksi</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.transactions}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Pendapatan</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">Rp {totals.revenue.toLocaleString('id-ID')}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Produk aktif</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.products}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Layanan aktif</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{totals.services}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
