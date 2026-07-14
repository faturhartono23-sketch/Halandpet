"use client";

import { useEffect, useMemo, useState } from 'react';
import { createTransaction } from '../actions';
import { buildTransactionPayload } from '@/lib/domain/transactions/checkout';
import { getSupabaseClient } from '@/lib/supabase/client';

type ProductOption = { id: string; name: string; price: number; stock_qty: number };
type ServiceOption = { id: string; name: string; price: number };

type CheckoutItem = {
  itemType: 'product' | 'service';
  itemId: string;
  itemName: string;
  priceAtTransaction: number;
  qty: number;
  petId?: string;
};

type CustomerOption = { id: string; full_name: string; phone?: string | null };
type PetOption = { id: string; name: string; customer_id: string; species?: string | null };

export default function CheckoutPage() {
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'other'>('cash');
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [items, setItems] = useState<CheckoutItem[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const loadOptions = async () => {
      const [{ data: productData }, { data: serviceData }, { data: customerData }, { data: petData }] = await Promise.all([
        supabase.from('products').select('id, name, price, stock_qty').eq('is_active', true),
        supabase.from('services').select('id, name, price').eq('is_active', true),
        supabase.from('customers').select('id, full_name, phone').order('created_at', { ascending: false }),
        supabase.from('pets').select('id, name, customer_id, species').order('created_at', { ascending: false }),
      ]);

      setProducts((productData ?? []) as ProductOption[]);
      setServices((serviceData ?? []) as ServiceOption[]);
      setCustomers((customerData ?? []) as CustomerOption[]);
      setPets((petData ?? []) as PetOption[]);

      if (!items.length) {
        const initialItems = [
          {
            itemType: 'product' as const,
            itemId: (productData?.[0]?.id ?? 'product-1'),
            itemName: (productData?.[0]?.name ?? 'Produk'),
            priceAtTransaction: Number(productData?.[0]?.price ?? 0),
            qty: 1,
          },
        ];
        setItems(initialItems);
      }
    };

    void loadOptions();
  }, []);

  const payload = useMemo(() => buildTransactionPayload({ items: items.map((item) => ({ ...item, petId: item.itemType === 'service' ? selectedPetId ?? item.petId : item.petId })), customerId, customerName, paymentMethod }), [customerId, customerName, items, paymentMethod, selectedPetId]);

  const addProduct = (product: ProductOption) => {
    setItems((current) => [
      ...current,
      {
        itemType: 'product',
        itemId: product.id,
        itemName: product.name,
        priceAtTransaction: Number(product.price),
        qty: 1,
      },
    ]);
  };

  const addService = (service: ServiceOption) => {
    setItems((current) => [
      ...current,
      {
        itemType: 'service',
        itemId: service.id,
        itemName: service.name,
        priceAtTransaction: Number(service.price),
        qty: 1,
        petId: selectedPetId ?? undefined,
      },
    ]);
  };

  const updateItemQty = (index: number, qty: number) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, qty: Math.max(1, qty) } : item)));
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">POS</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Checkout Transaksi</h1>
        <p className="mt-3 text-sm text-slate-600">
          Pilih item dari data produk dan layanan yang tersimpan di database, lalu simpan transaksi dengan snapshot harga.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-medium text-slate-900">Produk tersedia</h2>
              <div className="mt-3 space-y-2">
                {products.map((product) => (
                  <button key={product.id} type="button" onClick={() => addProduct(product)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700">
                    <span>{product.name}</span>
                    <span>Rp {Number(product.price).toLocaleString('id-ID')}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-medium text-slate-900">Layanan tersedia</h2>
              <div className="mt-3 space-y-2">
                {services.map((service) => (
                  <button key={service.id} type="button" onClick={() => addService(service)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700">
                    <span>{service.name}</span>
                    <span>Rp {Number(service.price).toLocaleString('id-ID')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-medium text-slate-900">Informasi Checkout</h2>
            <form action={createTransaction} className="mt-4 space-y-4 text-sm text-slate-600">
              {items.map((item, index) => (
                <div key={`${item.itemId}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span>{item.itemName}</span>
                    <input type="hidden" name={`itemId-${index}`} value={item.itemId} />
                    <input type="hidden" name={`itemName-${index}`} value={item.itemName} />
                    <input type="hidden" name={`itemType-${index}`} value={item.itemType} />
                    <input type="hidden" name={`price-${index}`} value={item.priceAtTransaction} />
                    <input type="hidden" name={`qty-${index}`} value={item.qty} />
                    <input type="hidden" name={`petId-${index}`} value={item.petId ?? ''} />
                    <input type="number" min="1" value={item.qty} onChange={(event) => updateItemQty(index, Number(event.target.value))} className="w-16 rounded-lg border border-slate-300 px-2 py-1" />
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                    Snapshot harga: Rp {item.priceAtTransaction.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
              <div>
                <label className="mb-2 block font-medium text-slate-700">Customer</label>
                <select value={customerId ?? ''} onChange={(event) => {
                  const nextCustomerId = event.target.value || null;
                  setCustomerId(nextCustomerId);
                  if (!nextCustomerId) {
                    setSelectedPetId(null);
                  } else {
                    const firstPet = pets.find((pet) => pet.customer_id === nextCustomerId);
                    setSelectedPetId(firstPet?.id ?? null);
                  }
                }} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="">Walk-in / anonim</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.full_name}</option>
                  ))}
                </select>
                <input type="hidden" name="customerId" value={customerId ?? ''} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-slate-700">Nama Customer</label>
                <input name="customerName" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
              </div>
              <div>
                <label className="mb-2 block font-medium text-slate-700">Hewan untuk layanan</label>
                <select value={selectedPetId ?? ''} onChange={(event) => setSelectedPetId(event.target.value || null)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="">Pilih hewan (opsional)</option>
                  {pets.filter((pet) => !customerId || pet.customer_id === customerId).map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name} {pet.species ? `(${pet.species})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-medium text-slate-700">Metode Pembayaran</label>
                <select name="paymentMethod" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as 'cash' | 'transfer' | 'other')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                  <option value="cash">Cash</option>
                  <option value="transfer">Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span>Nomor Transaksi</span>
                  <span className="font-semibold text-slate-900">{payload.transaction_number}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span>Total</span>
                  <span className="font-semibold text-slate-900">Rp {payload.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
              <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
