import Link from 'next/link';
import { getStockAlertStatus } from '@/lib/domain/products/stock';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ProductsPage() {
  const supabase = getSupabaseClient();
  let products: Array<{ id: string; name: string; stock_qty: number; min_stock_alert: number }> = [];

  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, stock_qty, min_stock_alert')
      .order('created_at', { ascending: false });

    if (!error) {
      products = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Products</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manajemen Produk</h1>
          </div>
          <Link href="/products/new" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Tambah Produk
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="font-medium text-slate-900">Status stok cepat</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {products.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-600">Belum ada produk yang terdaftar.</div>
            ) : (
              products.map((product) => {
                const status = getStockAlertStatus(product.stock_qty, product.min_stock_alert);
                const badgeClass =
                  status === 'critical'
                    ? 'bg-rose-100 text-rose-700'
                    : status === 'low'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700';

                return (
                  <div key={product.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-600">Stok saat ini: {product.stock_qty}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
                      {status === 'critical' ? 'Kritis' : status === 'low' ? 'Rentan' : 'Aman'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
