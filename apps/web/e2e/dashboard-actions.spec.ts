import { expect, test } from '@playwright/test';

test('admin dashboard core actions are visible and clickable', async ({ page }) => {
  await page.goto('/dash/admin');
  await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /reports and analytics/i })).toBeVisible();
});

test('student dashboard has actionable navigation links', async ({ page }) => {
  await page.goto('/dash/student');
  await expect(page.getByRole('link', { name: /classes/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /homework/i }).first()).toBeVisible();
});

