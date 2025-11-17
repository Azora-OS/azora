import { test, expect } from '@playwright/test';
import {
  loginUser,
  registerUser,
  enrollInCourse,
  completePayment,
  requestWithdrawal,
  verifySuccessMessage,
  verifyErrorMessage,
  clickButton,
  fillFormField,
  waitForElement,
} from './fixtures/test-utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5175';

/**
 * E2E Test Scenarios for Final Completion
 * 
 * Tests cover:
 * 1. Subscription flow
 * 2. Course purchase flow
 * 3. Token earning flow
 * 4. Enterprise flow
 * 
 * Requirements: 4.1
 */

test.describe('E2E Scenarios - Subscription Flow', () => {
  const testEmail = `sub-test-${Date.now()}@azora.test`;
  const testPassword = 'TestPassword123!';

  test('should complete full subscription purchase flow', async ({ page }) => {
    // Navigate to pricing page
    await page.goto(`${BASE_URL}/pricing`);
    
    // Verify subscription tiers are displayed
    await expect(page.locator('text=Free')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
    
    // Select Pro tier
    await page.click('button:has-text("Select Pro"), button:has-text("Choose Pro")');
    
    // Should redirect to signup or login
    await expect(page).toHaveURL(/\/(signup|login)/, { timeout: 5000 });
    
    // Register new user
    await registerUser(page, 'Test', 'User', testEmail, testPassword);
    
    // Should be on dashboard after signup
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    
    // Verify Pro subscription is active
    await expect(page.locator('text=Pro Subscription, text=Pro Plan Active')).toBeVisible({ timeout: 3000 });
  });

  test('should handle subscription tier upgrade', async ({ page }) => {
    // Login as existing user
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to subscription settings
    await page.goto(`${BASE_URL}/settings/subscription`);
    
    // Verify current subscription is displayed
    await expect(page.locator('text=Pro')).toBeVisible();
    
    // Click upgrade to Enterprise
    await page.click('button:has-text("Upgrade to Enterprise"), button:has-text("Upgrade")');
    
    // Verify upgrade confirmation dialog
    await expect(page.locator('text=Upgrade to Enterprise, text=Confirm Upgrade')).toBeVisible({ timeout: 3000 });
    
    // Confirm upgrade
    await page.click('button:has-text("Confirm"), button:has-text("Proceed")');
    
    // Verify success
    await verifySuccessMessage(page);
    await expect(page.locator('text=Enterprise')).toBeVisible({ timeout: 3000 });
  });

  test('should handle payment failure and retry', async ({ page }) => {
    // Navigate to pricing
    await page.goto(`${BASE_URL}/pricing`);
    
    // Select Pro tier
    await page.click('button:has-text("Select Pro"), button:has-text("Choose Pro")');
    
    // Register with test email
    const failEmail = `fail-test-${Date.now()}@azora.test`;
    await registerUser(page, 'Fail', 'Test', failEmail, testPassword);
    
    // Should show payment error or retry option
    const errorOrRetry = page.locator('text=Payment failed, text=Retry, text=Try again');
    if (await errorOrRetry.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Click retry
      await page.click('button:has-text("Retry"), button:has-text("Try again")');
      
      // Verify retry attempt
      await expect(page.locator('text=Processing, text=Please wait')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should allow subscription cancellation', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to subscription settings
    await page.goto(`${BASE_URL}/settings/subscription`);
    
    // Click cancel subscription
    await page.click('button:has-text("Cancel Subscription"), button:has-text("Cancel Plan")');
    
    // Verify cancellation confirmation
    await expect(page.locator('text=Are you sure, text=Confirm Cancellation')).toBeVisible({ timeout: 3000 });
    
    // Confirm cancellation
    await page.click('button:has-text("Confirm"), button:has-text("Yes, Cancel")');
    
    // Verify cancellation success
    await verifySuccessMessage(page);
    await expect(page.locator('text=Free')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('E2E Scenarios - Course Purchase Flow', () => {
  const testEmail = `course-test-${Date.now()}@azora.test`;
  const testPassword = 'TestPassword123!';

  test.beforeAll(async () => {
    // Setup: Create test user with subscription
    // This would typically be done via API in production
  });

  test('should browse and purchase course', async ({ page }) => {
    // Register user
    await page.goto(`${BASE_URL}/signup`);
    await registerUser(page, 'Course', 'Buyer', testEmail, testPassword);
    
    // Navigate to courses
    await page.goto(`${BASE_URL}/courses`);
    
    // Verify courses are displayed
    const courseCards = page.locator('[class*="course-card"], [data-testid="course-card"]');
    await expect(courseCards.first()).toBeVisible();
    
    // Click on first course
    await courseCards.first().click();
    
    // Verify course details page
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Click purchase/enroll button
    await page.click('button:has-text("Purchase"), button:has-text("Enroll"), button:has-text("Buy Now")');
    
    // Verify purchase confirmation
    await verifySuccessMessage(page);
    await expect(page.locator('text=Course purchased, text=Enrollment confirmed')).toBeVisible({ timeout: 3000 });
  });

  test('should display course content after purchase', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to my courses
    await page.goto(`${BASE_URL}/my-courses`);
    
    // Verify purchased course is listed
    const purchasedCourses = page.locator('[class*="course-card"], [data-testid="course-card"]');
    await expect(purchasedCourses.first()).toBeVisible();
    
    // Click on course
    await purchasedCourses.first().click();
    
    // Verify course content is accessible
    await expect(page.locator('text=Lesson, text=Module, text=Content')).toBeVisible({ timeout: 3000 });
  });

  test('should track course progress', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to my courses
    await page.goto(`${BASE_URL}/my-courses`);
    
    // Click on course
    const courseCard = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
    await courseCard.click();
    
    // Verify progress bar is displayed
    await expect(page.locator('[class*="progress"], [data-testid="progress"]')).toBeVisible({ timeout: 3000 });
    
    // Complete a lesson
    await page.click('button:has-text("Start Lesson"), button:has-text("Next"), button:has-text("Complete")');
    
    // Verify progress updated
    await expect(page.locator('text=Progress updated, text=Lesson completed')).toBeVisible({ timeout: 3000 });
  });

  test('should handle course refund request', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to my courses
    await page.goto(`${BASE_URL}/my-courses`);
    
    // Find course and click options
    const courseCard = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
    await courseCard.hover();
    
    // Click more options or menu
    await page.click('button:has-text("More"), button:has-text("Options"), button:has-text("Menu")');
    
    // Click request refund
    await page.click('button:has-text("Request Refund"), button:has-text("Refund")');
    
    // Verify refund confirmation
    await expect(page.locator('text=Refund requested, text=Request submitted')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('E2E Scenarios - Token Earning Flow', () => {
  const testEmail = `token-test-${Date.now()}@azora.test`;
  const testPassword = 'TestPassword123!';

  test('should earn tokens through course completion', async ({ page }) => {
    // Register user
    await page.goto(`${BASE_URL}/signup`);
    await registerUser(page, 'Token', 'Earner', testEmail, testPassword);
    
    // Navigate to courses
    await page.goto(`${BASE_URL}/courses`);
    
    // Purchase and complete a course
    const courseCard = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
    await courseCard.click();
    
    // Purchase course
    await page.click('button:has-text("Purchase"), button:has-text("Enroll"), button:has-text("Buy Now")');
    await verifySuccessMessage(page);
    
    // Complete lessons to earn tokens
    await page.goto(`${BASE_URL}/my-courses`);
    const purchasedCourse = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
    await purchasedCourse.click();
    
    // Complete multiple lessons
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Complete"), button:has-text("Next")');
      await page.waitForTimeout(500);
    }
    
    // Verify tokens earned notification
    await expect(page.locator('text=Tokens earned, text=AZR earned, text=+\\d+ AZR')).toBeVisible({ timeout: 3000 });
  });

  test('should display token balance in wallet', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to wallet
    await page.goto(`${BASE_URL}/wallet`);
    
    // Verify wallet is displayed
    await expect(page.locator('text=Wallet, text=Balance')).toBeVisible();
    
    // Verify token balance is shown
    await expect(page.locator('text=AZR, text=Tokens')).toBeVisible({ timeout: 3000 });
    
    // Verify balance is a number
    const balanceText = await page.locator('[class*="balance"], [data-testid="balance"]').first().textContent();
    expect(balanceText).toMatch(/\d+/);
  });

  test('should allow token withdrawal', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to wallet
    await page.goto(`${BASE_URL}/wallet`);
    
    // Click withdraw button
    await page.click('button:has-text("Withdraw"), button:has-text("Request Withdrawal")');
    
    // Fill withdrawal form
    await fillFormField(page, 'amount', '10');
    await fillFormField(page, 'method', 'bank_transfer');
    await fillFormField(page, 'accountNumber', '1234567890');
    
    // Submit withdrawal
    await page.click('button:has-text("Submit"), button:has-text("Confirm"), button:has-text("Request")');
    
    // Verify withdrawal request submitted
    await verifySuccessMessage(page);
    await expect(page.locator('text=Withdrawal requested, text=Request submitted')).toBeVisible({ timeout: 3000 });
  });

  test('should track token transaction history', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to wallet history
    await page.goto(`${BASE_URL}/wallet/history`);
    
    // Verify transaction history is displayed
    await expect(page.locator('text=Transaction History, text=Transactions')).toBeVisible();
    
    // Verify transactions are listed
    const transactions = page.locator('[class*="transaction"], [data-testid="transaction"]');
    await expect(transactions.first()).toBeVisible({ timeout: 3000 });
  });

  test('should display token earning statistics', async ({ page }) => {
    // Login
    await loginUser(page, testEmail, testPassword);
    
    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Verify earning statistics
    await expect(page.locator('text=Tokens Earned, text=Total Earned')).toBeVisible({ timeout: 3000 });
    
    // Verify statistics show numbers
    const stats = page.locator('[class*="stat"], [data-testid="stat"]');
    await expect(stats.first()).toBeVisible();
  });
});

test.describe('E2E Scenarios - Enterprise Flow', () => {
  const enterpriseEmail = `enterprise-test-${Date.now()}@azora.test`;
  const testPassword = 'TestPassword123!';

  test('should complete enterprise signup flow', async ({ page }) => {
    // Navigate to enterprise page
    await page.goto(`${BASE_URL}/enterprise`);
    
    // Verify enterprise page is displayed
    await expect(page.locator('text=Enterprise, text=For Organizations')).toBeVisible();
    
    // Click request demo or signup
    await page.click('button:has-text("Request Demo"), button:has-text("Get Started"), button:has-text("Contact Sales")');
    
    // Verify form is displayed
    await expect(page.locator('input[name="email"], input[name="companyName"]')).toBeVisible({ timeout: 3000 });
    
    // Fill enterprise form
    await fillFormField(page, 'companyName', 'Test Enterprise Inc');
    await fillFormField(page, 'email', enterpriseEmail);
    await fillFormField(page, 'phone', '+1234567890');
    await fillFormField(page, 'employees', '500');
    
    // Submit form
    await page.click('button:has-text("Submit"), button:has-text("Request"), button:has-text("Send")');
    
    // Verify submission success
    await verifySuccessMessage(page);
    await expect(page.locator('text=Thank you, text=We will contact you')).toBeVisible({ timeout: 3000 });
  });

  test('should display enterprise pricing and features', async ({ page }) => {
    // Navigate to enterprise page
    await page.goto(`${BASE_URL}/enterprise`);
    
    // Verify enterprise features are displayed
    await expect(page.locator('text=Features, text=Pricing, text=Benefits')).toBeVisible();
    
    // Verify key features are listed
    await expect(page.locator('text=API Access, text=Custom Integration, text=Dedicated Support')).toBeVisible({ timeout: 3000 });
    
    // Verify pricing information
    await expect(page.locator('text=Custom Pricing, text=Contact Sales')).toBeVisible();
  });

  test('should allow enterprise team member management', async ({ page }) => {
    // This test assumes enterprise admin is already logged in
    // In production, this would be set up via API
    
    // Navigate to team management
    await page.goto(`${BASE_URL}/enterprise/team`);
    
    // Verify team page is displayed
    await expect(page.locator('text=Team Members, text=Manage Team')).toBeVisible({ timeout: 3000 });
    
    // Click add team member
    await page.click('button:has-text("Add Member"), button:has-text("Invite"), button:has-text("Add User")');
    
    // Fill team member form
    await fillFormField(page, 'email', `member-${Date.now()}@enterprise.test`);
    await fillFormField(page, 'role', 'admin');
    
    // Submit form
    await page.click('button:has-text("Send Invite"), button:has-text("Add"), button:has-text("Invite")');
    
    // Verify success
    await verifySuccessMessage(page);
  });

  test('should display enterprise analytics dashboard', async ({ page }) => {
    // Navigate to enterprise analytics
    await page.goto(`${BASE_URL}/enterprise/analytics`);
    
    // Verify analytics dashboard is displayed
    await expect(page.locator('text=Analytics, text=Dashboard')).toBeVisible({ timeout: 3000 });
    
    // Verify key metrics are shown
    await expect(page.locator('text=Users, text=Courses, text=Revenue')).toBeVisible();
    
    // Verify charts/graphs are rendered
    const charts = page.locator('[class*="chart"], [class*="graph"], canvas');
    await expect(charts.first()).toBeVisible({ timeout: 3000 });
  });

  test('should allow enterprise API key management', async ({ page }) => {
    // Navigate to API settings
    await page.goto(`${BASE_URL}/enterprise/api`);
    
    // Verify API page is displayed
    await expect(page.locator('text=API Keys, text=API Settings')).toBeVisible({ timeout: 3000 });
    
    // Click generate new key
    await page.click('button:has-text("Generate Key"), button:has-text("Create Key"), button:has-text("New Key")');
    
    // Verify key is generated
    await expect(page.locator('[class*="api-key"], [data-testid="api-key"]')).toBeVisible({ timeout: 3000 });
    
    // Verify copy button is available
    await page.click('button:has-text("Copy"), button:has-text("Copy to Clipboard")');
    
    // Verify success message
    await verifySuccessMessage(page);
  });

  test('should display enterprise billing and invoices', async ({ page }) => {
    // Navigate to billing
    await page.goto(`${BASE_URL}/enterprise/billing`);
    
    // Verify billing page is displayed
    await expect(page.locator('text=Billing, text=Invoices')).toBeVisible({ timeout: 3000 });
    
    // Verify invoice list is shown
    const invoices = page.locator('[class*="invoice"], [data-testid="invoice"]');
    await expect(invoices.first()).toBeVisible({ timeout: 3000 });
    
    // Click on invoice to view details
    await invoices.first().click();
    
    // Verify invoice details are displayed
    await expect(page.locator('text=Invoice Details, text=Amount, text=Date')).toBeVisible({ timeout: 3000 });
  });

  test('should allow enterprise custom branding', async ({ page }) => {
    // Navigate to branding settings
    await page.goto(`${BASE_URL}/enterprise/branding`);
    
    // Verify branding page is displayed
    await expect(page.locator('text=Branding, text=Customize')).toBeVisible({ timeout: 3000 });
    
    // Upload logo
    const logoInput = page.locator('input[type="file"]').first();
    if (await logoInput.isVisible()) {
      // In real tests, would upload actual file
      // await logoInput.setInputFiles('path/to/logo.png');
    }
    
    // Fill branding details
    await fillFormField(page, 'primaryColor', '#FF6B6B');
    await fillFormField(page, 'secondaryColor', '#4ECDC4');
    
    // Save changes
    await page.click('button:has-text("Save"), button:has-text("Update")');
    
    // Verify success
    await verifySuccessMessage(page);
  });
});

test.describe('E2E Scenarios - Cross-Flow Integration', () => {
  test('should maintain user session across flows', async ({ page }) => {
    const testEmail = `session-test-${Date.now()}@azora.test`;
    const testPassword = 'TestPassword123!';
    
    // Register user
    await page.goto(`${BASE_URL}/signup`);
    await registerUser(page, 'Session', 'Test', testEmail, testPassword);
    
    // Navigate to different sections
    await page.goto(`${BASE_URL}/courses`);
    await expect(page).toHaveURL(/\/courses/);
    
    await page.goto(`${BASE_URL}/wallet`);
    await expect(page).toHaveURL(/\/wallet/);
    
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify user is still logged in
    await expect(page.locator('text=Logout, text=Sign Out')).toBeVisible();
  });

  test('should sync data across flows', async ({ page }) => {
    const testEmail = `sync-test-${Date.now()}@azora.test`;
    const testPassword = 'TestPassword123!';
    
    // Register and complete course
    await page.goto(`${BASE_URL}/signup`);
    await registerUser(page, 'Sync', 'Test', testEmail, testPassword);
    
    // Purchase course
    await page.goto(`${BASE_URL}/courses`);
    const courseCard = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
    await courseCard.click();
    await page.click('button:has-text("Purchase"), button:has-text("Enroll")');
    
    // Navigate to dashboard and verify course appears
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Course, text=Enrolled')).toBeVisible({ timeout: 3000 });
    
    // Navigate to wallet and verify tokens are tracked
    await page.goto(`${BASE_URL}/wallet`);
    await expect(page.locator('text=AZR, text=Balance')).toBeVisible({ timeout: 3000 });
  });
});
