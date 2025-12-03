import { test, expect } from '@playwright/test';

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
  });

  test('should browse courses', async ({ page }) => {
    await page.goto('/courses');
    
    await expect(page.locator('[data-testid="course-card"]')).toHaveCount(10, { timeout: 5000 });
  });

  test('should view course details', async ({ page }) => {
    await page.goto('/courses');
    await page.click('[data-testid="course-card"]:first-child');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Enroll Now')).toBeVisible();
  });

  test('should enroll in free course', async ({ page }) => {
    await page.goto('/courses/intro-to-programming');
    await page.click('text=Enroll Now');
    
    await expect(page.locator('text=Successfully enrolled')).toBeVisible();
    await expect(page).toHaveURL(/\/courses\/intro-to-programming\/learn/);
  });

  test('should access enrolled course', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="my-courses"]');
    await page.click('[data-testid="course-card"]:first-child');
    
    await expect(page.locator('[data-testid="lesson-list"]')).toBeVisible();
  });
});
