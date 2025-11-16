import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Subscription Purchase Flow', () => {
  test('should complete full subscription purchase flow', async ({ page }) => {
    // Navigate to pricing page
    await page.goto(`${BASE_URL}/pricing`);
    
    // Verify subscription tiers are displayed
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    // Select Pro tier
    await page.click('button:has-text("Select Pro")');
    
    // Verify redirect to signup/login
    await expect(page).toHaveURL(/\/(signup|login)/);
    
    // Fill signup form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Accept terms
    await page.check('input[name="terms"]');
    
    // Submit signup
    await page.click('button:has-text("Sign Up")');
    
    // Wait for payment page
    await page.waitForURL(/\/payment/);
    
    // Fill payment details
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cardnumber"]').fill('4242424242424242');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cvc"]').fill('123');
    
    // Submit payment
    await page.click('button:has-text("Complete Purchase")');
    
    // Verify success
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=Pro Subscription Active')).toBeVisible();
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    await page.click('button:has-text("Select Pro")');
    
    // Fill form with test declined card
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.check('input[name="terms"]');
    await page.click('button:has-text("Sign Up")');
    
    await page.waitForURL(/\/payment/);
    
    // Use declined card
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cardnumber"]').fill('4000000000000002');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cvc"]').fill('123');
    
    await page.click('button:has-text("Complete Purchase")');
    
    // Verify error message
    await expect(page.locator('text=Payment declined')).toBeVisible();
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should allow tier upgrade', async ({ page, context }) => {
    // Login as existing user
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/dashboard/);
    
    // Navigate to subscription settings
    await page.click('a:has-text("Subscription Settings")');
    
    // Upgrade to Enterprise
    await page.click('button:has-text("Upgrade to Enterprise")');
    
    // Verify proration message
    await expect(page.locator('text=Prorated charge')).toBeVisible();
    
    // Complete payment
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cardnumber"]').fill('4242424242424242');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="exp-date"]').fill('12/25');
    await page.frameLocator('iframe[title="Stripe"]').locator('input[name="cvc"]').fill('123');
    
    await page.click('button:has-text("Confirm Upgrade")');
    
    // Verify upgrade
    await expect(page.locator('text=Enterprise Subscription Active')).toBeVisible();
  });
});
