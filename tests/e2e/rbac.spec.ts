import { test, expect } from '@playwright/test';

const credentials = {
  email: 'staff@example.com',
  password: 'Staff123!',
};

test('staff can access POS but cannot access pricing owner module', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/login');

  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');
  await page.goto('/pos');
  await expect(page.getByText('Point of Sale')).toBeVisible();

  await page.goto('/owner/pricing');
  await expect(page.getByText('Akses terbatas')).toBeVisible();

  const storageState = await context.storageState();
  await context.close();

  const reuseContext = await browser.newContext({ storageState });
  const reusePage = await reuseContext.newPage();
  await reusePage.goto('/pos');
  await expect(reusePage.getByText('Point of Sale')).toBeVisible();
  await reuseContext.close();
});