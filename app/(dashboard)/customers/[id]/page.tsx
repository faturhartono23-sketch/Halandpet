import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

type CustomerDetailPageProps = {
  params: { id: string };
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    notFound();
  }

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('id, full_name, phone, address, created_at')
    .eq('id', params.id)
    .single();

  if (customerError || !customer) {
    notFound();
  }

  const [{ data: pets }, { data: visits }] = await Promise.all([
    supabase.from('pets').select('id, name, species, breed').eq('customer_id', params.id).order('created_at', { ascending: false }),
    supabase.from('visits').select('id, visit_type, diagnosis, status, created_at').eq('pet_id', params.id).order('created_at', { ascending: false }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/customers" className="text-sm font-medium text-teal-600">← Kembali ke customer</Link>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Customer</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{customer.full_name}</h1>
        <p className="mt-3 text-sm text-slate-600">Telepon: {customer.phone ?? '-'} • Alamat: {customer.address ?? '-'}</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-medium text-slate-900">Hewan milik customer</h2>
            <div className="mt-4 space-y-3">
              {(pets ?? []).length === 0 ? (
                <p className="text-sm text-slate-600">Belum ada hewan yang terhubung ke customer ini.</p>
              ) : (
                (pets ?? []).map((pet) => (
                  <div key={pet.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-medium text-slate-900">{pet.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{pet.species ?? '-'} • {pet.breed ?? '-'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-medium text-slate-900">Riwayat visit</h2>
            <div className="mt-4 space-y-3">
              {(visits ?? []).length === 0 ? (
                <p className="text-sm text-slate-600">Belum ada visit untuk customer ini.</p>
              ) : (
                (visits ?? []).map((visit) => (
                  <div key={visit.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-700">{visit.visit_type ?? 'Visit'}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{visit.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{visit.diagnosis ?? 'Tidak ada diagnosa'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(visit.created_at).toLocaleString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
