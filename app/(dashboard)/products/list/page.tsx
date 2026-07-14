import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ProductsListPage() {
  const supabase = getSupabaseClient();
  let products: Array<{ id: string; name: string; price: number; stock_qty: number }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('products').select('id, name, price, stock_qty').order('created_at', { ascending: false });
    if (!error) {
      products = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Produk</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Daftar Produk</h1>
          </div>
          <a href="/products/new" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Tambah Produk
          </a>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Harga</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Belum ada data produk. Tambahkan produk pertama Anda.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                    <td className="px-4 py-3">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{product.stock_qty}</td>
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
