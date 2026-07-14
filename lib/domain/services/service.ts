export type ServiceFormValues = {
  id?: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  isActive?: boolean;
};

export function normalizeServiceInput(values: ServiceFormValues) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    price: Number(values.price),
    duration_minutes: values.durationMinutes != null ? Number(values.durationMinutes) : null,
    is_active: values.isActive ?? true,
  };
}
