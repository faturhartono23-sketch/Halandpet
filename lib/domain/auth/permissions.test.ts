import { describe, expect, it } from 'vitest';
import { canAccessModule, getVisibleDashboardModules } from './permissions';

describe('role-based module access', () => {
  it('allows owner to access pricing controls but blocks staff', () => {
    expect(canAccessModule('owner', 'pricing')).toBe(true);
    expect(canAccessModule('staff', 'pricing')).toBe(false);
  });

  it('returns the right dashboard modules for a dokter role', () => {
    expect(getVisibleDashboardModules('dokter').map((module) => module.slug)).toEqual(['dashboard', 'clinic', 'pets']);
  });
});
