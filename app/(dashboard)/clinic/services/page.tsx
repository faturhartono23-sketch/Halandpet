import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ServicesPage() {
  const supabase = getSupabaseClient();
  let services: Array<{ id: string; name: string; description: string | null; price: number; duration_minutes: number | null }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('services').select('id, name, description, price, duration_minutes').order('created_at', { ascending: false });
    if (!error) {
      services = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Layanan Klinik</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Manajemen Layanan</h1>
          </div>
          <Link href="/clinic/services/list" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Lihat Daftar
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {services.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada layanan klinik yang tersimpan.
            </div>
          ) : (
            services.map((service) => (
              <div key={service.id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-medium text-slate-900">{service.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{service.description ?? 'Tidak ada deskripsi'}</p>
                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
                    Rp {Number(service.price).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="mt-4 text-sm text-slate-600">Durasi: {service.duration_minutes ?? '-'} menit</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
