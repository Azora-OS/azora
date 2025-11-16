import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {
  test('User signup flow', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Course enrollment flow', async ({ page }) => {
    await page.goto('/courses');
    await page.click('.course-card:first-child');
    await page.click('button:has-text("Enroll")');
    await expect(page.locator('.enrollment-success')).toBeVisible();
  });

  test('Payment flow', async ({ page }) => {
    await page.goto('/wallet');
    await page.click('button:has-text("Add Funds")');
    await page.fill('[name="amount"]', '100');
    await page.click('button:has-text("Continue")');
    await expect(page.locator('.payment-success')).toBeVisible();
  });

  test('Withdrawal flow', async ({ page }) => {
    await page.goto('/wallet');
    await page.click('button:has-text("Withdraw")');
    await page.fill('[name="amount"]', '50');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('.withdrawal-pending')).toBeVisible();
  });
});
