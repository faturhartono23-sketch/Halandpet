import { createCustomer } from './actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function CustomersPage() {
  const supabase = getSupabaseClient();
  let customers: Array<{ id: string; full_name: string; phone: string | null; address: string | null }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('customers').select('id, full_name, phone, address').order('created_at', { ascending: false });
    if (!error) {
      customers = data ?? [];
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Belum ada data customer.</div>
          ) : (
            customers.map((customer) => (
              <div key={customer.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{customer.full_name}</h2>
                <p className="mt-2 text-sm text-slate-600">{customer.phone ?? '-'}</p>
                <p className="mt-2 text-sm text-slate-600">{customer.address ?? '-'}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
