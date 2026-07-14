"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateCartSubtotal, calculateCartTotal, type CartLine } from '@/lib/domain/pos/cart';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function PosPage() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const loadLines = async () => {
      const [{ data: products }, { data: services }] = await Promise.all([
        supabase.from('products').select('id, name, price').eq('is_active', true).limit(3),
        supabase.from('services').select('id, name, price').eq('is_active', true).limit(3),
      ]);

      const initialLines: CartLine[] = [
        ...(products ?? []).map((product: any, index: number) => ({
          id: `product-${index}`,
          itemType: 'product' as const,
          itemId: product.id,
          itemName: product.name,
          price: Number(product.price),
          qty: 1,
        })),
        ...(services ?? []).map((service: any, index: number) => ({
          id: `service-${index}`,
          itemType: 'service' as const,
          itemId: service.id,
          itemName: service.name,
          price: Number(service.price),
          qty: 1,
        })),
      ];
      setLines(initialLines);
    };

    void loadLines();
  }, []);

  const subtotal = useMemo(() => calculateCartSubtotal(lines), [lines]);
  const total = useMemo(() => calculateCartTotal(lines, discount), [discount, lines]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">POS</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Point of Sale</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pos/checkout" className="rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">Checkout</Link>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">Staff</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-medium text-slate-900">Keranjang</h2>
            <div className="mt-4 space-y-3">
              {lines.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">Belum ada item aktif dari data produk atau layanan.</div>
              ) : (
                lines.map((line) => (
                  <div key={line.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{line.itemName}</p>
                        <p className="text-sm text-slate-500">{line.itemType === 'product' ? 'Produk' : 'Layanan'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">Rp {line.price.toLocaleString('id-ID')}</p>
                        <p className="text-sm text-slate-500">Qty {line.qty}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-medium text-slate-900">Ringkasan Transaksi</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Diskon</span>
                <input type="number" value={discount} onChange={(event) => setDiscount(Number(event.target.value))} className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-right" />
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>Total</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Status</p>
              <p className="mt-1">Transaksi campuran produk dan layanan siap diproses dari satu layar.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
