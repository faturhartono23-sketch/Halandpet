import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ServicesListPage() {
  const supabase = getSupabaseClient();
  let services: Array<{ id: string; name: string; price: number; duration_minutes: number | null }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('services').select('id, name, price, duration_minutes').order('created_at', { ascending: false });
    if (!error) {
      services = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Layanan</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Daftar Layanan</h1>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Harga</th>
                <th className="px-4 py-3 text-left font-medium text-slate-700">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    Belum ada layanan klinik yang tersedia.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{service.name}</td>
                    <td className="px-4 py-3">Rp {Number(service.price).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{service.duration_minutes ?? '-'} menit</td>
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
