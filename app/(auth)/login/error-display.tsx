'use client';

import { useSearchParams } from 'next/navigation';

export function LoginErrorDisplay() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    'missing-credentials': 'Email dan password harus diisi.',
    'invalid-credentials': 'Email atau password salah. Silakan coba lagi.',
    'missing-config': 'Konfigurasi Supabase tidak lengkap.',
    'unknown': 'Terjadi kesalahan. Silakan coba lagi.',
  };

  const errorMessage = errorParam && errorMessages[errorParam] ? errorMessages[errorParam] : null;

  if (!errorMessage) return null;

  return (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {errorMessage}
    </div>
  );
}
