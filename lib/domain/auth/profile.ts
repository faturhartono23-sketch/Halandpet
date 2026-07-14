export type UserProfile = {
  id: string;
  full_name: string;
  role: 'owner' | 'dokter' | 'staff' | 'customer';
  phone: string | null;
  is_active: boolean;
};

export function getRoleLabel(role: UserProfile['role']) {
  const labels: Record<UserProfile['role'], string> = {
    owner: 'Owner',
    dokter: 'Dokter',
    staff: 'Staff',
    customer: 'Customer',
  };

  return labels[role];
}

export async function ensureProfileForCurrentUser(supabase: {
  auth: { getUser: () => Promise<{ data: { user: { id: string; email?: string | null } | null }; error: { message: string } | null }> };
  from: (table: string) => {
    select: (...args: unknown[]) => { eq: (...args: unknown[]) => { maybeSingle: () => Promise<{ data: Partial<UserProfile> | null; error: { message: string } | null }> } };
    upsert: (payload: Partial<UserProfile>) => Promise<{ error: { message: string } | null }>;
  };
}) {
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user || error) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select().eq('id', user.id).maybeSingle();

  if (profileError || profile) {
    return profile as UserProfile | null;
  }

  const fallbackRole: UserProfile['role'] = 'customer';
  const payload = {
    id: user.id,
    full_name: user.email?.split('@')[0] ?? 'User',
    role: fallbackRole,
    phone: null,
    is_active: true,
  };

  const { error: upsertError } = await supabase.from('profiles').upsert(payload);
  if (upsertError) {
    return null;
  }

  return payload as UserProfile;
}
