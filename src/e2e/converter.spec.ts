import { expect, test } from '@playwright/test';

test('full converter journey', async ({ page }) => {
  await page.route('**/api/rates**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('history')) {
      await route.fulfill({
        json: {
          from: 'USD',
          to: 'EUR',
          changePercent: 1.2,
          points: [
            { date: '2024-01-01', rate: 0.91 },
            { date: '2024-01-07', rate: 0.92 },
          ],
        },
      });
      return;
    }
    await route.fulfill({
      json: {
        base: url.searchParams.get('base') ?? 'USD',
        timestamp: Date.now(),
        rates: { USD: 1, EUR: 0.92, GBP: 0.78, JPY: 150, INR: 83, CAD: 1.36, AUD: 1.52 },
        source: 'exchangerate-api',
      },
    });
  });

  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByLabel(/amount/i).fill('100');
  await expect(page.getByText(/EUR/i).first()).toBeVisible();
  await page.getByRole('button', { name: /swap currencies/i }).click();
  await expect(page.locator('#from-currency')).toBeVisible();
  await expect(page.getByRole('heading', { name: /7-day/i })).toBeVisible();
});
