import { describe, expect, it } from 'vitest';
import { sortVisitsByDate } from './visit';

describe('visit helpers', () => {
  it('sorts visits newest first', () => {
    const visits = [
      { id: '1', petName: 'Milo', visitType: 'checkup', diagnosis: 'Sehat', treatmentNotes: 'Observasi', status: 'completed' as const, createdAt: '2024-01-01T10:00:00.000Z' },
      { id: '2', petName: 'Milo', visitType: 'vaksin', diagnosis: 'Vaksin rutin', treatmentNotes: 'Disuntik', status: 'completed' as const, createdAt: '2024-02-02T10:00:00.000Z' },
    ];

    expect(sortVisitsByDate(visits).map((visit) => visit.id)).toEqual(['2', '1']);
  });
});
