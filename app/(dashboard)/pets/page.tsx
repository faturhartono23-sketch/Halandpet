import { createPet } from './actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function PetsPage() {
  const supabase = getSupabaseClient();
  let pets: Array<{ id: string; name: string; species: string | null; breed: string | null; customer_id: string; notes: string | null }> = [];
  let customers: Array<{ id: string; full_name: string }> = [];
  let visits: Array<{ id: string; pet_id: string; visit_type: string | null; diagnosis: string | null; status: string; created_at: string }> = [];

  if (supabase) {
    const [{ data: petData, error: petError }, { data: customerData, error: customerError }, { data: visitData, error: visitError }] = await Promise.all([
      supabase.from('pets').select('id, name, species, breed, customer_id, notes').order('created_at', { ascending: false }),
      supabase.from('customers').select('id, full_name').order('created_at', { ascending: false }),
      supabase.from('visits').select('id, pet_id, visit_type, diagnosis, status, created_at').order('created_at', { ascending: false }),
    ]);

    if (!petError) {
      pets = petData ?? [];
    }
    if (!customerError) {
      customers = customerData ?? [];
    }
    if (!visitError) {
      visits = visitData ?? [];
    }
  }

  const customerLookup = new Map(customers.map((customer) => [customer.id, customer.full_name]));
  const visitsByPet = new Map<string, typeof visits>();
  visits.forEach((visit) => {
    const existing = visitsByPet.get(visit.pet_id) ?? [];
    existing.push(visit);
    visitsByPet.set(visit.pet_id, existing);
  });

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Pets</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Profil Pet & Riwayat Perawatan</h1>
        <p className="mt-3 text-sm text-slate-600">
          Form tambah hewan dan daftar hewan yang terhubung dengan customer.
        </p>

        <form action={createPet} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Customer</label>
            <select name="customerId" className="w-full rounded-lg border border-slate-300 px-3 py-2" required>
              <option value="">Pilih customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nama Pet</label>
            <input name="name" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Spesies</label>
            <input name="species" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Breed</label>
            <input name="breed" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Jenis Kelamin</label>
            <input name="sex" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
            <input type="date" name="birthDate" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Berat (kg)</label>
            <input type="number" step="0.1" name="weightKg" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan</label>
            <input name="notes" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="lg:col-span-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Simpan Pet
            </button>
          </div>
        </form>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {pets.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Belum ada data pet yang terhubung ke customer.</div>
          ) : (
            pets.map((pet) => (
              <div key={pet.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">{pet.name}</h2>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-teal-700">{pet.species ?? 'Hewan'}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{pet.breed ?? '-'} • {pet.notes ?? 'Tidak ada catatan khusus'}</p>
                <p className="mt-2 text-sm text-slate-600">Customer: {customerLookup.get(pet.customer_id) ?? 'Tidak diketahui'}</p>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Riwayat perawatan</p>
                  {((visitsByPet.get(pet.id) ?? []).length === 0) ? (
                    <p className="mt-2">Belum ada visit yang tercatat untuk pet ini.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {(visitsByPet.get(pet.id) ?? []).slice(0, 3).map((visit) => (
                        <li key={visit.id} className="rounded border border-slate-200 px-2 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-slate-700">{visit.visit_type ?? 'Visit'}</span>
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{visit.status}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{visit.diagnosis ?? 'Tidak ada diagnosa'} • {new Date(visit.created_at).toLocaleString('id-ID')}</p>
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
