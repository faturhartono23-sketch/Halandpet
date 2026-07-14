export type CustomerFormValues = {
  fullName: string;
  phone?: string;
  address?: string;
};

export function normalizeCustomerInput(values: CustomerFormValues) {
  return {
    full_name: values.fullName.trim(),
    phone: values.phone?.trim() || null,
    address: values.address?.trim() || null,
  };
}
