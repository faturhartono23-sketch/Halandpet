import { test, expect } from '@playwright/test';

test('landing page renders app intro', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Sistem Manajemen Klinik Hewan & Petshop')).toBeVisible();
});
