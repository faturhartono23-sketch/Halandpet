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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.14),_transparent_30%),linear-gradient(135deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-600">Halandpet</p>
            <p className="text-sm text-slate-500">Dashboard operasional klinik & petshop</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            {modules.map((module) => (
              <Link key={module.slug} href={module.href} className="rounded-full border border-transparent px-3 py-2 transition hover:border-slate-200 hover:bg-white hover:text-slate-950">
                {module.label}
              </Link>
            ))}
            <div className="ml-2 rounded-full border border-slate-200 bg-white px-3 py-2">
              <AuthStatus />
            </div>
          </nav>
        </div>
      </header>
      <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
