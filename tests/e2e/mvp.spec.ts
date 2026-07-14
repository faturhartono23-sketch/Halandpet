import { test, expect } from '@playwright/test';

test('landing page and core routes are accessible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sistem Manajemen Klinik Hewan & Petshop')).toBeVisible();

  await page.goto('/products');
  await expect(page.getByText('Manajemen Produk')).toBeVisible();
  await expect(page.getByText('Status stok cepat')).toBeVisible();

  await page.goto('/pos');
  await expect(page.getByText('Point of Sale')).toBeVisible();
  await expect(page.getByText('Ringkasan Transaksi')).toBeVisible();

  await page.goto('/customers');
  await expect(page.getByText('Customer & Pet Records')).toBeVisible();

  await page.goto('/pets');
  await expect(page.getByText('Profil Pet & Riwayat Perawatan')).toBeVisible();

  await page.goto('/clinic/visits');
  await expect(page.getByText('Visits & Medical Records')).toBeVisible();
});
