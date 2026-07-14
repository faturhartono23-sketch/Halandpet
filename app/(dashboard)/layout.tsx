import Link from 'next/link';
import { AuthStatus } from '@/app/components/auth-status';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getVisibleDashboardModules } from '@/lib/domain/auth/permissions';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  let role: 'owner' | 'dokter' | 'staff' | 'customer' = 'customer';

  if (supabase) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (data?.role) {
        role = data.role as 'owner' | 'dokter' | 'staff' | 'customer';
      }
    }
  }

  const modules = getVisibleDashboardModules(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Halandpet</p>
            <p className="text-sm text-slate-500">Dashboard</p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            {modules.map((module) => (
              <Link key={module.slug} href={module.href} className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-950">
                {module.label}
              </Link>
            ))}
            <AuthStatus />
          </nav>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
