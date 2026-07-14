export type AppRole = 'owner' | 'dokter' | 'staff' | 'customer';

export type DashboardModule = {
  slug: string;
  label: string;
  href: string;
};

const moduleCatalog: Record<AppRole, DashboardModule[]> = {
  owner: [
    { slug: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { slug: 'products', label: 'Produk', href: '/products' },
    { slug: 'clinic', label: 'Klinik', href: '/clinic/visits' },
    { slug: 'pos', label: 'POS', href: '/pos' },
    { slug: 'pricing', label: 'Kontrol Harga', href: '/owner/pricing' },
  ],
  dokter: [
    { slug: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { slug: 'clinic', label: 'Klinik', href: '/clinic/visits' },
    { slug: 'pets', label: 'Hewan', href: '/pets' },
  ],
  staff: [
    { slug: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { slug: 'products', label: 'Produk', href: '/products' },
    { slug: 'pos', label: 'POS', href: '/pos' },
    { slug: 'customers', label: 'Customer', href: '/customers' },
  ],
  customer: [
    { slug: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { slug: 'pets', label: 'Hewan Saya', href: '/pets' },
  ],
};

export function canAccessModule(role: AppRole, moduleSlug: string) {
  return getVisibleDashboardModules(role).some((module) => module.slug === moduleSlug);
}

export function getVisibleDashboardModules(role: AppRole) {
  return moduleCatalog[role] ?? moduleCatalog.customer;
}
