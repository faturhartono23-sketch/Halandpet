export type ProductFormValues = {
  id?: string;
  name: string;
  categoryId?: string;
  sku?: string;
  price: number;
  costPrice?: number;
  stockQty: number;
  unit?: string;
  minStockAlert?: number;
  isActive?: boolean;
};

export function normalizeProductInput(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    category_id: values.categoryId ?? null,
    sku: values.sku?.trim() || null,
    price: Number(values.price),
    cost_price: values.costPrice != null ? Number(values.costPrice) : null,
    stock_qty: Number(values.stockQty || 0),
    unit: values.unit?.trim() || 'pcs',
    min_stock_alert: values.minStockAlert != null ? Number(values.minStockAlert) : 5,
    is_active: values.isActive ?? true,
  };
}
