import { test, expect } from '@playwright/test';

const credentials = {
  email: 'owner@halandpet.test',
  password: 'Owner123!',
};

test('login via UI form on /login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
  await expect(page.getByText('Selamat datang di Halandpet')).toBeVisible();
});

test('can reuse storage state after login', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('/login');
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');

  await page.waitForURL('/dashboard');
  const storageState = await context.storageState();

  await context.close();

  const reuseContext = await browser.newContext({ storageState });
  const reusePage = await reuseContext.newPage();
  await reusePage.goto('/dashboard');

  await expect(reusePage.getByText('Selamat datang di Halandpet')).toBeVisible();
  await reuseContext.close();
});