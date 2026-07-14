"use client";

import { useEffect, useState } from 'react';
import { createProduct } from '../actions';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function NewProductPage() {
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    sku: '',
    price: '0',
    costPrice: '0',
    stockQty: '0',
    unit: 'pcs',
    minStockAlert: '5',
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    void supabase.from('product_categories').select('id, name').order('name').then(({ data }) => {
      setCategories((data ?? []) as Array<{ id: string; name: string }>);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">Produk</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Tambah Produk</h1>

        <form action={createProduct} className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nama Produk</label>
            <input
              name="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              required
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Kategori</label>
              <select name="categoryId" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Tanpa kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Satuan</label>
              <input
                name="unit"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Harga Jual</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Harga Modal</label>
              <input
                type="number"
                name="costPrice"
                value={form.costPrice}
                onChange={(event) => setForm({ ...form, costPrice: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Stok</label>
              <input
                type="number"
                name="stockQty"
                value={form.stockQty}
                onChange={(event) => setForm({ ...form, stockQty: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Min Stock Alert</label>
            <input
              type="number"
              name="minStockAlert"
              value={form.minStockAlert}
              onChange={(event) => setForm({ ...form, minStockAlert: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Simpan Produk
          </button>
        </form>
      </div>
    </main>
  );
}
