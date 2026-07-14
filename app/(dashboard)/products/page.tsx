import Link from 'next/link';
import { createCategory, adjustStock } from './actions';
import { getStockAlertStatus } from '@/lib/domain/products/stock';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ProductsPage() {
  const supabase = getSupabaseClient();
  let products: Array<{ id: string; name: string; stock_qty: number; min_stock_alert: number }> = [];
  let categories: Array<{ id: string; name: string }> = [];

  if (supabase) {
    const [{ data: productData, error: productError }, { data: categoryData, error: categoryError }] = await Promise.all([
      supabase.from('products').select('id, name, stock_qty, min_stock_alert').order('created_at', { ascending: false }),
      supabase.from('product_categories').select('id, name').order('name'),
    ]);

    if (!productError) {
      products = productData ?? [];
    }
    if (!categoryError) {
      categories = categoryData ?? [];
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-slate-900">Status stok cepat</h2>
                <span className="text-sm text-slate-500">
                  {products.filter((product) => getStockAlertStatus(product.stock_qty, product.min_stock_alert) !== 'ok').length} item butuh perhatian
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {products.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-600">Belum ada produk aktif yang terdaftar. Tambahkan produk pertama melalui tombol di atas.</div>
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
                        <p className="text-sm text-slate-600">
                          Stok saat ini: {product.stock_qty} · minimum alert: {product.min_stock_alert}
                        </p>
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

          <div className="space-y-6">
            <form action={createCategory} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-medium text-slate-900">Buat kategori produk</h2>
              <input name="name" placeholder="Mis. Makanan" className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Simpan kategori</button>
            </form>

            <form action={adjustStock} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-medium text-slate-900">Sesuaikan stok</h2>
              <div className="mt-4 space-y-3">
                <select name="productId" className="w-full rounded-lg border border-slate-300 px-3 py-2" required>
                  <option value="">Pilih produk</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input name="delta" type="number" defaultValue={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                <input name="reason" placeholder="Contoh: restock, rusak, penyesuaian" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                <button type="submit" className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500">Simpan penyesuaian</button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-medium text-slate-900">Kategori aktif</h2>
              <div className="mt-3 space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-600">Belum ada kategori produk.</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{category.name}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
