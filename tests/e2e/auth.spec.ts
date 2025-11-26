import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[name="email"]', `test-${Date.now()}@azora.world`);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'invalid@azora.world');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout user', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    await expect(page).toHaveURL('/');
  });
});
