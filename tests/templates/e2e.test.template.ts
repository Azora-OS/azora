/**
 * End-to-End Test Template
 * 
 * Purpose: Test complete user journeys from UI to database
 * Scope: Full application stack
 * Dependencies: Running application with test environment
 * 
 * Naming Convention: [feature].e2e.test.ts
 * Location: tests/e2e/ directory
 * 
 * Note: E2E tests are slower and more brittle. Use sparingly for critical paths.
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
test.describe.configure({ mode: 'serial' });

test.describe('Critical User Journey', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    // Set up test environment
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    // Clean up
    await page.close();
  });

  test.beforeEach(async () => {
    // Reset application state
    // Clear cookies/storage
    // Navigate to starting point
  });

  test('User Registration Flow', async () => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill in registration form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.fill('[name="confirmPassword"]', 'SecurePassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/verify-email');

    // Verify success message
    await expect(page.locator('.success-message')).toContainText('Check your email');

    // Verify email was sent (check test email service)
    // const emails = await getTestEmails('test@example.com');
    // expect(emails).toHaveLength(1);
  });

  test('User Login Flow', async () => {
    // Arrange: Create test user
    // await createTestUser({ email: 'test@example.com', password: 'password' });

    // Navigate to login page
    await page.goto('/login');

    // Fill in login form
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');

    // Verify user is logged in
    await expect(page.locator('.user-menu')).toBeVisible();
    await expect(page.locator('.user-email')).toContainText('test@example.com');
  });

  test('Complete Purchase Flow', async () => {
    // Arrange: Set up test data
    // await createTestUser();
    // await createTestCourse();

    // Act: Navigate through purchase flow
    await page.goto('/courses');
    await page.click('.course-card:first-child');
    await page.click('button:has-text("Enroll Now")');

    // Fill payment information
    await page.fill('[name="cardNumber"]', '4242424242424242');
    await page.fill('[name="expiry"]', '12/25');
    await page.fill('[name="cvc"]', '123');

    // Submit payment
    await page.click('button:has-text("Pay Now")');

    // Wait for confirmation
    await page.waitForURL('/enrollment/success');

    // Assert: Verify enrollment
    await expect(page.locator('.success-message')).toContainText('Successfully enrolled');

    // Verify in database
    // const enrollment = await prisma.enrollment.findFirst({
    //   where: { userId: testUser.id }
    // });
    // expect(enrollment).toBeDefined();
  });

  test('Error Handling', async () => {
    // Test error scenarios
    await page.goto('/login');

    // Submit with invalid credentials
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');

    // Verify user is not logged in
    await expect(page.locator('.user-menu')).not.toBeVisible();
  });

  test('Accessibility', async () => {
    // Test keyboard navigation
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Test screen reader labels
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toHaveAttribute('aria-label');

    // Test color contrast
    // Use axe-core or similar tool
  });

  test('Performance', async () => {
    // Measure page load time
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;

    // Assert performance budget
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });
});

/**
 * Best Practices:
 * 
 * 1. Test critical user journeys only
 * 2. Use page object pattern for reusability
 * 3. Wait for elements explicitly
 * 4. Test error scenarios
 * 5. Verify accessibility
 * 6. Check performance budgets
 * 7. Clean up test data
 * 8. Use stable selectors (data-testid)
 * 
 * Coverage Goals:
 * - Cover 5-10 critical paths
 * - Test happy path and error cases
 * - Verify accessibility
 * - Check performance
 * 
 * Performance:
 * - Keep E2E tests under 10% of total tests
 * - Run in parallel when possible
 * - Use test sharding for large suites
 */
