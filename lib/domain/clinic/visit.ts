export type VisitRecord = {
  id: string;
  petName: string;
  visitType: string;
  diagnosis: string;
  treatmentNotes: string;
  status: 'ongoing' | 'completed';
  createdAt: string;
};

export function sortVisitsByDate(visits: VisitRecord[]) {
  return [...visits].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}
