import Link from 'next/link';
import { Suspense } from 'react';
import { LoginErrorDisplay } from './error-display';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Halandpet</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">Masuk ke Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Kelola operasional klinik dan petshop Anda</p>
        </div>

        <Suspense>
          <LoginErrorDisplay />
        </Suspense>

        <LoginForm />

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
