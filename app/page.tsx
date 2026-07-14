import Link from 'next/link';

const highlights = [
  'POS terpadu untuk produk dan layanan klinik',
  'Riwayat perawatan hewan yang tersusun kronologis',
  'Kontrol harga owner-only dengan audit trail',
  'Laporan penjualan dan status stok yang terintegrasi',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">Halandpet</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Sistem manajemen klinik hewan & petshop yang terintegrasi.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Kelola stok, transaksi, customer, pet, dan rekam medis dari satu dashboard profesional untuk operasional harian bisnis Anda.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-teal-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-teal-400">
              Masuk ke dashboard
            </Link>
            <Link href="/products" className="rounded-lg border border-white/20 px-5 py-3 font-medium text-white transition hover:bg-white/10">
              Lihat modul produk
            </Link>
          </div>
        </div>

        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold">Apa yang tersedia dalam MVP</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-teal-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-2xl border border-teal-400/30 bg-slate-900/40 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Siap digunakan untuk bisnis klinik hewan & petshop modern.</p>
            <p className="mt-2">Semua modul utama sudah dihubungkan ke data nyata dan role-based logic.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
