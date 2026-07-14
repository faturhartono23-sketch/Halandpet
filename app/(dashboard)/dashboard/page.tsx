import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getRoleLabel } from '@/lib/domain/auth/profile';

export default async function DashboardHomePage() {
  const supabase = getSupabaseClient();
  let profile = null as { full_name: string; role: 'owner' | 'dokter' | 'staff' | 'customer' } | null;
  let productCount = 0;
  let serviceCount = 0;
  let transactionCount = 0;

  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      const { data } = await supabase.from('profiles').select('full_name, role').eq('id', userId).maybeSingle();
      profile = data;
    }

    const [{ count: productCountData }, { count: serviceCountData }, { count: transactionCountData }] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
    ]);

    productCount = productCountData ?? 0;
    serviceCount = serviceCountData ?? 0;
    transactionCount = transactionCountData ?? 0;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Selamat datang di Halandpet</h1>
        <p className="mt-3 text-sm text-slate-600">
          {profile ? `Halo ${profile.full_name} — ${getRoleLabel(profile.role)}.` : 'Kelola produk, layanan, POS, dan rekam medis dari satu tempat.'}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Produk aktif</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{productCount}</p>
            <p className="mt-2 text-sm text-slate-600">Terhubung ke stok dan manajemen inventory.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Layanan klinik</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{serviceCount}</p>
            <p className="mt-2 text-sm text-slate-600">Siap dipakai untuk visit medis dan billing.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Transaksi tersimpan</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{transactionCount}</p>
            <p className="mt-2 text-sm text-slate-600">Riwayat penjualan dan layanan dalam satu sistem.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link href="/products" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300">
            <h2 className="font-medium text-slate-900">Produk & Stok</h2>
            <p className="mt-2 text-sm text-slate-600">Pantau stok, minimum alert, dan item aktif.</p>
          </Link>
          <Link href="/pos" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300">
            <h2 className="font-medium text-slate-900">POS</h2>
            <p className="mt-2 text-sm text-slate-600">Buat transaksi campuran produk dan layanan dengan snapshot harga.</p>
          </Link>
          <Link href="/clinic/visits" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300">
            <h2 className="font-medium text-slate-900">Klinik</h2>
            <p className="mt-2 text-sm text-slate-600">Catat visit medis dan lihat riwayat perawatan hewan.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
