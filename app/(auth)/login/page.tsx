import Link from 'next/link';
import { signInWithEmail } from './actions';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Halandpet</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Masuk ke dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Gunakan kredensial Supabase Auth untuk mengakses area operasional bisnis.</p>

        <form action={signInWithEmail} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input id="password" name="password" type="password" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
            Masuk
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
