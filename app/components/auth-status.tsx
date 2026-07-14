"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export function AuthStatus() {
  const [sessionReady, setSessionReady] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setSessionReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      setUserEmail(data.session?.user?.email ?? null);
      setSessionReady(true);
    };

    void loadSession();
  }, []);

  if (!sessionReady) {
    return <span className="text-sm text-slate-500">Memuat sesi...</span>;
  }

  if (!userEmail) {
    return (
      <Link href="/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
        Masuk
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">{userEmail}</span>
      <button
        type="button"
        onClick={async () => {
          const supabase = getSupabaseClient();
          await supabase?.auth.signOut();
          window.location.href = '/login';
        }}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Keluar
      </button>
    </div>
  );
}
