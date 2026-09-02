import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/rates**', async (route) => {
      await route.fulfill({
        json: {
          base: 'USD',
          timestamp: Date.now(),
          rates: { USD: 1, EUR: 0.92, GBP: 0.78 },
          source: 'exchangerate-api',
        },
      });
    });
  });

  test('home page has no critical or serious violations', async ({ page }) => {
    await page.goto('/en');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (item) => item.impact === 'critical' || item.impact === 'serious',
    );
    expect(serious).toEqual([]);
  });

  test('pair page has no critical or serious violations', async ({ page }) => {
    await page.goto('/en/usd-to-eur');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (item) => item.impact === 'critical' || item.impact === 'serious',
    );
    expect(serious).toEqual([]);
  });
});
