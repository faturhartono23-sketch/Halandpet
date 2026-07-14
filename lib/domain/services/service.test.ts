import { describe, expect, it } from 'vitest';
import { normalizeServiceInput } from './service';

describe('service normalization', () => {
  it('normalizes a service payload for persistence', () => {
    const normalized = normalizeServiceInput({
      name: '  Konsultasi  ',
      description: '  Pemeriksaan umum  ',
      price: 150000,
      durationMinutes: 30,
      isActive: true,
    });

    expect(normalized).toEqual({
      name: 'Konsultasi',
      description: 'Pemeriksaan umum',
      price: 150000,
      duration_minutes: 30,
      is_active: true,
    });
  });
});
