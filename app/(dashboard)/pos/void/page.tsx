"use client";

import { useState } from 'react';

export default function VoidTransactionPage() {
  const [reason, setReason] = useState('Kesalahan input');

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">POS</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Void Transaksi</h1>
        <p className="mt-3 text-sm text-slate-600">
          Halaman ini mempersiapkan alur void transaksi yang hanya owner yang bisa lakukan, dengan alasan pencabutan.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Alasan Void</label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Simpan Void
          </button>
        </div>
      </div>
    </main>
  );
}
