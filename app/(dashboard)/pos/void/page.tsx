import { voidTransaction } from './actions';

export default function VoidTransactionPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">POS</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Void Transaksi</h1>
        <p className="mt-3 text-sm text-slate-600">
          Alur void sekarang mengikat ke transaksi yang tersimpan di database dan hanya owner yang bisa menandai transaksi sebagai batal.
        </p>

        <form action={voidTransaction} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nomor Transaksi</label>
            <input
              name="transactionNumber"
              placeholder="INV-20260714-0001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Alasan Void</label>
            <textarea
              name="reason"
              placeholder="Contoh: pelanggan membatalkan pembelian, data salah input"
              className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Void hanya bisa dilakukan oleh owner dan akan menandai transaksi sebagai dibatalkan. Transaksi yang sudah void tidak bisa diubah kembali lewat alur ini.
          </div>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
            Simpan Void
          </button>
        </form>
      </div>
    </main>
  );
}
