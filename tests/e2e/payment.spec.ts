import { test, expect } from '@playwright/test';

test.describe('Payment Processing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@azora.world');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
  });

  test('should add course to cart', async ({ page }) => {
    await page.goto('/courses/advanced-javascript');
    await page.click('text=Add to Cart');
    
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('should proceed to checkout', async ({ page }) => {
    await page.goto('/courses/advanced-javascript');
    await page.click('text=Add to Cart');
    await page.click('[data-testid="cart-icon"]');
    await page.click('text=Checkout');
    
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('text=Order Summary')).toBeVisible();
  });

  test('should complete payment with test card', async ({ page }) => {
    await page.goto('/checkout');
    
    // Fill payment details (Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242');
    await stripeFrame.locator('[name="exp-date"]').fill('12/25');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    
    await page.click('button:has-text("Pay Now")');
    
    await expect(page.locator('text=Payment successful')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/dashboard/courses');
  });

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/checkout');
    
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
    await stripeFrame.locator('[name="cardnumber"]').fill('4000000000000002');
    await stripeFrame.locator('[name="exp-date"]').fill('12/25');
    await stripeFrame.locator('[name="cvc"]').fill('123');
    
    await page.click('button:has-text("Pay Now")');
    
    await expect(page.locator('text=Payment failed')).toBeVisible();
  });
});
