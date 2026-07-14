export type PetFormValues = {
  customerId: string;
  name: string;
  species?: string;
  breed?: string;
  sex?: string;
  birthDate?: string;
  weightKg?: string;
  notes?: string;
};

export function normalizePetInput(values: PetFormValues) {
  return {
    customer_id: values.customerId,
    name: values.name.trim(),
    species: values.species?.trim() || null,
    breed: values.breed?.trim() || null,
    sex: values.sex?.trim() || null,
    birth_date: values.birthDate || null,
    weight_kg: values.weightKg ? Number(values.weightKg) : null,
    notes: values.notes?.trim() || null,
  };
}
