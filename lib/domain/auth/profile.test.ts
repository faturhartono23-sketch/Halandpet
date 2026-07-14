import { describe, expect, it } from 'vitest';
import { ensureProfileForCurrentUser } from './profile';

describe('ensureProfileForCurrentUser', () => {
  it('creates a profile for an authenticated user when none exists yet', async () => {
    const upserted: Array<Record<string, unknown>> = [];
    const supabase = {
      auth: {
        getUser: async () => ({
          data: {
            user: { id: 'user-1', email: 'owner@example.com' },
          },
          error: null,
        }),
      },
      from: (table: string) => {
        if (table !== 'profiles') {
          throw new Error('Unexpected table');
        }

        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
          upsert: async (payload: Record<string, unknown>) => {
            upserted.push(payload);
            return { error: null };
          },
        };
      },
    };

    const profile = await ensureProfileForCurrentUser(supabase as never);

    expect(profile?.id).toBe('user-1');
    expect(profile?.full_name).toBe('owner');
    expect(profile?.role).toBe('customer');
    expect(upserted).toHaveLength(1);
  });
});
