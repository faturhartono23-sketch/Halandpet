import Link from 'next/link';
import { createCustomer } from './actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function CustomersPage() {
  const supabase = getSupabaseClient();
  let customers: Array<{ id: string; full_name: string; phone: string | null; address: string | null; created_at: string }> = [];
  let petCounts: Record<string, number> = {};
  let recentVisits: Record<string, Array<{ id: string; created_at: string; visit_type: string | null; diagnosis: string | null }>> = {};

  if (supabase) {
    const [{ data: customerData, error: customerError }, { data: petData, error: petError }, { data: visitData, error: visitError }] = await Promise.all([
      supabase.from('customers').select('id, full_name, phone, address, created_at').order('created_at', { ascending: false }),
      supabase.from('pets').select('id, customer_id').order('created_at', { ascending: false }),
      supabase.from('visits').select('id, pet_id, visit_type, diagnosis, created_at').order('created_at', { ascending: false }),
    ]);

    if (!customerError) {
      customers = customerData ?? [];
    }
    if (!petError) {
      petData?.forEach((pet) => {
        petCounts[pet.customer_id] = (petCounts[pet.customer_id] ?? 0) + 1;
      });
    }
    if (!visitError) {
      const petVisits: Record<string, Array<{ id: string; created_at: string; visit_type: string | null; diagnosis: string | null }>> = {};
      visitData?.forEach((visit) => {
        const petId = visit.pet_id;
        if (!petId) return;
        if (!petVisits[petId]) {
          petVisits[petId] = [];
        }
        petVisits[petId].push(visit);
      });

      const petToCustomer: Record<string, string> = {};
      petData?.forEach((pet) => {
        petToCustomer[pet.id] = pet.customer_id;
      });

      Object.entries(petVisits).forEach(([petId, visits]) => {
        const customerId = petToCustomer[petId];
        if (!customerId) return;
        recentVisits[customerId] = [...(recentVisits[customerId] ?? []), ...visits];
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Customer</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Customer & Pet Records</h1>
        <p className="mt-3 text-sm text-slate-600">
          Daftar customer yang sudah tersimpan dan form tambah customer baru.
        </p>

        <form action={createCustomer} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input name="fullName" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Telepon</label>
            <input name="phone" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Alamat</label>
            <input name="address" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="lg:col-span-3">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Simpan Customer
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {customers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Belum ada customer yang tercatat. Tambahkan customer pertama Anda melalui form di atas.</div>
          ) : (
            customers.map((customer) => (
              <div key={customer.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/customers/${customer.id}`} className="text-lg font-semibold text-slate-900 hover:text-teal-600">
                    {customer.full_name}
                  </Link>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-teal-700">
                    {petCounts[customer.id] ?? 0} hewan
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Telepon: {customer.phone ?? '-'}</p>
                <p className="mt-2 text-sm text-slate-600">Alamat: {customer.address ?? '-'}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">Terdaftar {new Date(customer.created_at).toLocaleDateString('id-ID')}</p>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Aktivitas terakhir</p>
                  {(recentVisits[customer.id] ?? []).length === 0 ? (
                    <p className="mt-2">Belum ada visit yang tercatat untuk customer ini.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {(recentVisits[customer.id] ?? []).slice(0, 2).map((visit) => (
                        <li key={visit.id} className="rounded border border-slate-200 px-2 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-700">{visit.visit_type ?? 'Visit'}</span>
                            <span className="text-xs text-slate-400">{new Date(visit.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{visit.diagnosis ?? 'Tidak ada diagnosa'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
