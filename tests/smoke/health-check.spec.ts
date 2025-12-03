import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Health Checks', () => {
  test('API Gateway is healthy', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('Auth service is healthy', async ({ request }) => {
    const response = await request.get('/api/auth/health');
    expect(response.ok()).toBeTruthy();
  });

  test('Education service is healthy', async ({ request }) => {
    const response = await request.get('/api/education/health');
    expect(response.ok()).toBeTruthy();
  });

  test('Payment service is healthy', async ({ request }) => {
    const response = await request.get('/api/pay/health');
    expect(response.ok()).toBeTruthy();
  });

  test('Homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });
});
