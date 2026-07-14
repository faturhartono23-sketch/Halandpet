import { createPet } from './actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function PetsPage() {
  const supabase = getSupabaseClient();
  let pets: Array<{ id: string; name: string; species: string | null; breed: string | null; customer_id: string; notes: string | null }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('pets').select('id, name, species, breed, customer_id, notes').order('created_at', { ascending: false });
    if (!error) {
      pets = data ?? [];
    }
  }

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
            <label className="mb-2 block text-sm font-medium text-slate-700">Customer ID</label>
            <input name="customerId" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Belum ada data pet.</div>
          ) : (
            pets.map((pet) => (
              <div key={pet.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{pet.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{pet.species ?? '-'} • {pet.breed ?? '-'}</p>
                <p className="mt-2 text-sm text-slate-600">Customer ID: {pet.customer_id}</p>
                <p className="mt-2 text-sm text-slate-600">Catatan: {pet.notes ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
