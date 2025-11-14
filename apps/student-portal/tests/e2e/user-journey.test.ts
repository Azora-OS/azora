/**
 * E2E Test: Complete User Journey
 * Tests the full student workflow from login to course enrollment
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

test.describe('Student Portal E2E', () => {
  test('complete user journey: login → dashboard → enroll → wallet', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'test@azora.world');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    await page.click('a[href="/courses"]');
    await page.waitForURL('**/courses');
    
    const enrollButton = page.locator('button:has-text("Enroll Now")').first();
    if (await enrollButton.isVisible()) {
      await enrollButton.click();
      await expect(page.locator('text=Enrolled successfully')).toBeVisible({ timeout: 5000 });
    }
    
    await page.click('a[href="/wallet"]');
    await page.waitForURL('**/wallet');
    await expect(page.locator('text=Total Balance')).toBeVisible();
  });

  test('API health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`);
    expect(response.ok()).toBeTruthy();
  });
});
