import { createVisit } from './actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function VisitsPage() {
  const supabase = getSupabaseClient();
  let visits: Array<{ id: string; pet_id: string; visit_type: string | null; diagnosis: string | null; treatment_notes: string | null; status: string; created_at: string }> = [];

  if (supabase) {
    const { data, error } = await supabase.from('visits').select('id, pet_id, visit_type, diagnosis, treatment_notes, status, created_at').order('created_at', { ascending: false });
    if (!error) {
      visits = data ?? [];
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Clinic</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Visits & Medical Records</h1>
        <p className="mt-3 text-sm text-slate-600">
          Form input visit medis dan riwayat perawatan yang tersimpan ke database.
        </p>

        <form action={createVisit} className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Pet ID</label>
            <input name="petId" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Jenis Visit</label>
            <input name="visitType" className="w-full rounded-lg border border-slate-300 px-3 py-2" defaultValue="checkup" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Diagnosa</label>
            <input name="diagnosis" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
            <select name="status" className="w-full rounded-lg border border-slate-300 px-3 py-2" defaultValue="completed">
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Berat (kg)</label>
            <input type="number" step="0.1" name="weightKg" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Kunjungan Berikutnya</label>
            <input type="date" name="nextVisitRecommendation" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="lg:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">Catatan Perawatan</label>
            <textarea name="treatmentNotes" className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
          <div className="lg:col-span-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
              Simpan Visit
            </button>
          </div>
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h2 className="font-medium text-slate-900">Riwayat visit</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {visits.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-600">Belum ada visit yang tercatat.</div>
            ) : (
              visits.map((visit) => (
                <div key={visit.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Pet ID: {visit.pet_id}</p>
                      <p className="text-sm text-slate-600">{visit.visit_type ?? '-'} • {visit.diagnosis ?? '-'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${visit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {visit.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{visit.treatment_notes ?? '-'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
