import { test, expect } from '@playwright/test';

test.describe('Courses', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should display course list', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('.course-card')).toHaveCount(3);
  });

  test('should enroll in course', async ({ page }) => {
    await page.goto('/courses/test-course-id');
    await page.click('button:has-text("Enroll")');
    await expect(page.locator('.success')).toContainText('Enrolled');
  });
});
