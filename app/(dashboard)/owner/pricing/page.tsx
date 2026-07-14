import { buildPriceHistorySnapshot, formatPrice } from '@/lib/domain/pricing/price-history';
import { getSupabaseClient } from '@/lib/supabase/client';
import { canAccessModule } from '@/lib/domain/auth/permissions';
import { updatePrice } from './actions';

export default async function PricingPage() {
  const supabase = getSupabaseClient();
  let role: 'owner' | 'dokter' | 'staff' | 'customer' = 'customer';
  let history: Array<{ id: string; item_type: string; item_id: string; old_price: number | null; new_price: number | null; changed_at: string }> = [];
  let products: Array<{ id: string; name: string; price: number }> = [];
  let services: Array<{ id: string; name: string; price: number }> = [];

  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (data?.role) {
        role = data.role as 'owner' | 'dokter' | 'staff' | 'customer';
      }
    }

    const [{ data: historyData, error: historyError }, { data: productData, error: productError }, { data: serviceData, error: serviceError }] = await Promise.all([
      supabase.from('price_history').select('id, item_type, item_id, old_price, new_price, changed_at').order('changed_at', { ascending: false }),
      supabase.from('products').select('id, name, price').eq('is_active', true).order('name'),
      supabase.from('services').select('id, name, price').eq('is_active', true).order('name'),
    ]);

    if (!historyError) {
      history = historyData ?? [];
    }
    if (!productError) {
      products = productData ?? [];
    }
    if (!serviceError) {
      services = serviceData ?? [];
    }
  }

  if (!canAccessModule(role, 'pricing')) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Akses terbatas</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Halaman ini hanya tersedia untuk owner.</h1>
          <p className="mt-3 text-sm text-slate-600">Silakan kembali ke dashboard utama untuk melihat modul yang sesuai dengan peran Anda.</p>
        </div>
      </main>
    );
  }

  const priceHistory = buildPriceHistorySnapshot(
    history.map((entry) => ({
      id: entry.id,
      itemType: entry.item_type as 'product' | 'service',
      itemId: entry.item_id,
      oldPrice: Number(entry.old_price ?? 0),
      newPrice: Number(entry.new_price ?? 0),
      changedBy: 'owner',
      changedAt: entry.changed_at,
    }))
  );

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Owner</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Kontrol Harga</h1>
        <p className="mt-3 text-sm text-slate-600">
          Owner dapat mengubah harga produk dan layanan, lalu melihat audit trail perubahan di bawah ini.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Item</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Sebelum</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Sesudah</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {priceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">Belum ada riwayat perubahan harga.</td>
                  </tr>
                ) : (
                  priceHistory.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{entry.itemType === 'product' ? 'Produk' : 'Layanan'}</td>
                      <td className="px-4 py-3">{formatPrice(entry.oldPrice)}</td>
                      <td className="px-4 py-3">{formatPrice(entry.newPrice)}</td>
                      <td className="px-4 py-3">{entry.delta > 0 ? `+${formatPrice(entry.delta)}` : formatPrice(entry.delta)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Perbarui harga</h2>
            <p className="mt-2 text-sm text-slate-600">Ubah harga produk atau layanan yang aktif. Perubahan terekam di history dan langsung berlaku untuk transaksi berikutnya.</p>

            <form action={updatePrice} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Jenis item</label>
                <select name="itemType" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue="product">
                  <option value="product">Produk</option>
                  <option value="service">Layanan</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Pilih item</label>
                <select name="itemId" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue={products[0]?.id ?? services[0]?.id ?? ''}>
                  {[...products.map((product) => ({ id: product.id, label: `${product.name} (produk)`, value: product.price })), ...services.map((service) => ({ id: service.id, label: `${service.name} (layanan)`, value: service.price }))].map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Harga lama</label>
                  <input name="oldPrice" type="number" min="0" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue={products[0]?.price ?? services[0]?.price ?? 0} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Harga baru</label>
                  <input name="newPrice" type="number" min="0" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue={products[0]?.price ?? services[0]?.price ?? 0} />
                </div>
              </div>

              <input type="hidden" name="changedBy" value="owner" />

              <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                Simpan perubahan harga
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
