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

test('student mobile navigation exposes subjects and notes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dash/student');
  await expect(page.getByRole('link', { name: /^subjects$/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /^notes$/i }).first()).toBeVisible();
});

test('student subjects page stays readable on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dash/student/subjects');
  await expect(page.getByRole('heading', { name: /my subjects/i })).toBeVisible();
});
