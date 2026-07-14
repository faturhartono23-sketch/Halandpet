'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signInWithEmail } from './actions';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const [isLoading, setIsLoading] = useState(false);

  const errorMessages: Record<string, string> = {
    'missing-credentials': 'Email dan password harus diisi.',
    'invalid-credentials': 'Email atau password salah. Silakan coba lagi.',
    'missing-config': 'Konfigurasi Supabase tidak lengkap.',
    'unknown': 'Terjadi kesalahan. Silakan coba lagi.',
  };

  const errorMessage = errorParam && errorMessages[errorParam] ? errorMessages[errorParam] : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await signInWithEmail(formData);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Halandpet</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Masuk ke Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Kelola operasional klinik dan petshop Anda</p>
        </div>

        {errorMessage && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@halandpet.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-700 disabled:bg-slate-400"
          >
            {isLoading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-800">Akun Demo:</p>
          <ul className="mt-2 space-y-1 text-slate-600">
            <li>Owner: owner@example.com / Owner123!</li>
            <li>Dokter: dokter@example.com / Dokter123!</li>
            <li>Staff: staff@example.com / Staff123!</li>
            <li>Customer: customer@example.com / Customer123!</li>
          </ul>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-medium text-teal-600 hover:text-teal-700">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
