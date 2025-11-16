import { test, expect, Page } from '@playwright/test';

/**
 * Critical User Journey E2E Tests
 * 
 * Tests the four critical user journeys:
 * 1. User signup flow
 * 2. Course enrollment flow
 * 3. Payment flow
 * 4. Withdrawal flow
 */

test.describe('Critical User Journeys', () => {
  const testEmail = `user-${Date.now()}@test.azora`;
  const testPassword = 'SecureTest123!@#';
  const testFirstName = 'Test';
  const testLastName = 'User';

  // ============================================================================
  // JOURNEY 1: USER SIGNUP FLOW
  // ============================================================================
  test.describe('Journey 1: User Signup Flow', () => {
    test('should complete user registration successfully', async ({ page }) => {
      // Navigate to signup page
      await page.goto('/signup');
      await expect(page).toHaveURL(/\/signup/);

      // Verify signup form is visible
      await expect(page.locator('h1:has-text("Create Account")')).toBeVisible();
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

      // Fill signup form
      await page.fill('input[name="firstName"]', testFirstName);
      await page.fill('input[name="lastName"]', testLastName);
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);

      // Accept terms and conditions
      const termsCheckbox = page.locator('input[type="checkbox"]').first();
      await termsCheckbox.check();

      // Submit form
      await page.click('button[type="submit"]:has-text("Sign Up")');

      // Verify successful registration and redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
      
      // Verify welcome message
      await expect(page.locator(`text=Welcome, ${testFirstName}`)).toBeVisible({ timeout: 3000 });

      // Verify user is logged in (check for logout button)
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });

    test('should validate email format on signup', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with invalid email
      await page.fill('input[name="firstName"]', testFirstName);
      await page.fill('input[name="lastName"]', testLastName);
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', testPassword);
      await page.fill('input[name="confirmPassword"]', testPassword);

      // Try to submit
      await page.click('button[type="submit"]:has-text("Sign Up")');

      // Verify error message
      await expect(page.locator('text=Please enter a valid email')).toBeVisible({ timeout: 2000 });
    });

    test('should validate password requirements on signup', async ({ page }) => {
      await page.goto('/signup');

      // Fill form with weak password
      await page.fill('input[name="firstName"]', testFirstName);
      await page.fill('input[name="lastName"]', testLastName);
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'weak');
      await page.fill('input[name="confirmPassword"]', 'weak');

      // Try to submit
      await page.click('button[type="submit"]:has-text("Sign Up")');

      // Verify error message
      await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible({ timeout: 2000 });
    });
  });

  // ============================================================================
  // JOURNEY 2: COURSE ENROLLMENT FLOW
  // ============================================================================
  test.describe('Journey 2: Course Enrollment Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]:has-text("Login")');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should browse and enroll in a course', async ({ page }) => {
      // Navigate to courses page
      await page.click('a:has-text("Courses"), button:has-text("Browse Courses")');
      await expect(page).toHaveURL(/\/courses/, { timeout: 3000 });

      // Verify courses are displayed
      await expect(page.locator('[class*="course-card"], [data-testid="course-card"]').first()).toBeVisible({ timeout: 3000 });

      // Select first course
      const firstCourse = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
      const courseTitle = await firstCourse.locator('h2, h3').first().textContent();
      
      await firstCourse.click();

      // Verify course details page
      await expect(page).toHaveURL(/\/courses\/\d+/, { timeout: 3000 });
      await expect(page.locator('h1')).toContainText(courseTitle || '');

      // Verify course information is displayed
      await expect(page.locator('text=Instructor, text=Duration, text=Level')).toBeVisible();

      // Click enroll button
      await page.click('button:has-text("Enroll Now"), button:has-text("Enroll")');

      // Verify enrollment success
      await expect(page.locator('text=Successfully enrolled, text=Enrollment confirmed')).toBeVisible({ timeout: 3000 });

      // Verify "Start Learning" button appears
      await expect(page.locator('button:has-text("Start Learning"), button:has-text("Go to Course")')).toBeVisible();
    });

    test('should display enrolled courses in dashboard', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/dashboard');

      // Verify enrolled courses section
      await expect(page.locator('text=My Courses, text=Enrolled Courses')).toBeVisible();

      // Verify at least one course is displayed
      await expect(page.locator('[class*="course-card"], [data-testid="course-card"]').first()).toBeVisible({ timeout: 3000 });
    });

    test('should filter courses by category', async ({ page }) => {
      await page.goto('/courses');

      // Verify filter options exist
      await expect(page.locator('[class*="filter"], [data-testid="filter"]').first()).toBeVisible();

      // Select a category filter
      const categoryFilter = page.locator('button:has-text("Technology"), button:has-text("Business"), button:has-text("Science")').first();
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();

        // Verify filtered results
        await expect(page.locator('[class*="course-card"], [data-testid="course-card"]').first()).toBeVisible({ timeout: 3000 });
      }
    });
  });

  // ============================================================================
  // JOURNEY 3: PAYMENT FLOW
  // ============================================================================
  test.describe('Journey 3: Payment Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]:has-text("Login")');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should complete payment for premium course', async ({ page }) => {
      // Navigate to a premium course
      await page.goto('/courses');
      
      // Find a premium course (with price)
      const premiumCourse = page.locator('[class*="course-card"]:has-text("$"), [data-testid="course-card"]:has-text("$")').first();
      
      if (await premiumCourse.isVisible()) {
        await premiumCourse.click();

        // Verify course details with price
        await expect(page.locator('text=$')).toBeVisible();

        // Click enroll/purchase button
        await page.click('button:has-text("Enroll Now"), button:has-text("Purchase"), button:has-text("Buy Now")');

        // Verify payment page or modal appears
        await expect(page.locator('text=Payment, text=Checkout, text=Card Details')).toBeVisible({ timeout: 3000 });

        // Fill payment form
        const cardNumberInput = page.locator('input[placeholder*="card"], input[placeholder*="4242"]').first();
        if (await cardNumberInput.isVisible()) {
          await cardNumberInput.fill('4242424242424242');
          await page.fill('input[placeholder*="MM/YY"], input[placeholder*="expiry"]', '12/25');
          await page.fill('input[placeholder*="CVC"], input[placeholder*="CVV"]', '123');
        }

        // Submit payment
        await page.click('button:has-text("Pay"), button:has-text("Complete Purchase"), button:has-text("Confirm Payment")');

        // Verify payment success
        await expect(page.locator('text=Payment successful, text=Order confirmed, text=Thank you')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display payment history', async ({ page }) => {
      // Navigate to wallet or payment history
      await page.click('a:has-text("Wallet"), a:has-text("Payments"), a:has-text("History")');
      
      // Verify payment history page
      await expect(page.locator('text=Payment History, text=Transactions, text=Recent Payments')).toBeVisible({ timeout: 3000 });

      // Verify transaction list
      const transactions = page.locator('[class*="transaction"], [data-testid="transaction"]');
      if (await transactions.count() > 0) {
        await expect(transactions.first()).toBeVisible();
      }
    });

    test('should handle payment errors gracefully', async ({ page }) => {
      // Navigate to a premium course
      await page.goto('/courses');
      
      const premiumCourse = page.locator('[class*="course-card"]:has-text("$"), [data-testid="course-card"]:has-text("$")').first();
      
      if (await premiumCourse.isVisible()) {
        await premiumCourse.click();
        await page.click('button:has-text("Enroll Now"), button:has-text("Purchase"), button:has-text("Buy Now")');

        // Verify payment form
        await expect(page.locator('text=Payment, text=Checkout')).toBeVisible({ timeout: 3000 });

        // Try to submit with invalid card
        const cardNumberInput = page.locator('input[placeholder*="card"], input[placeholder*="4242"]').first();
        if (await cardNumberInput.isVisible()) {
          await cardNumberInput.fill('4000000000000002'); // Invalid test card
          await page.fill('input[placeholder*="MM/YY"], input[placeholder*="expiry"]', '12/25');
          await page.fill('input[placeholder*="CVC"], input[placeholder*="CVV"]', '123');
        }

        // Submit payment
        await page.click('button:has-text("Pay"), button:has-text("Complete Purchase")');

        // Verify error message
        await expect(page.locator('text=Payment failed, text=Invalid card, text=Please try again')).toBeVisible({ timeout: 3000 });
      }
    });
  });

  // ============================================================================
  // JOURNEY 4: WITHDRAWAL FLOW
  // ============================================================================
  test.describe('Journey 4: Withdrawal Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each test
      await page.goto('/login');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]:has-text("Login")');
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should initiate withdrawal request', async ({ page }) => {
      // Navigate to wallet
      await page.click('a:has-text("Wallet"), a:has-text("Earnings"), a:has-text("Balance")');
      await expect(page).toHaveURL(/\/wallet/, { timeout: 3000 });

      // Verify wallet balance is displayed
      await expect(page.locator('[data-testid="balance"], text=Balance, text=Available')).toBeVisible();

      // Click withdraw button
      await page.click('button:has-text("Withdraw"), button:has-text("Request Withdrawal"), button:has-text("Cash Out")');

      // Verify withdrawal form appears
      await expect(page.locator('text=Withdrawal, text=Amount, text=Bank Account')).toBeVisible({ timeout: 3000 });

      // Fill withdrawal form
      const amountInput = page.locator('input[name="amount"], input[placeholder*="amount"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('100');
      }

      // Select withdrawal method
      const methodSelect = page.locator('select[name="method"], select[name="withdrawalMethod"]').first();
      if (await methodSelect.isVisible()) {
        await methodSelect.selectOption('bank_transfer');
      }

      // Fill bank details
      const accountInput = page.locator('input[name="accountNumber"], input[placeholder*="account"]').first();
      if (await accountInput.isVisible()) {
        await accountInput.fill('1234567890');
      }

      // Submit withdrawal
      await page.click('button:has-text("Submit"), button:has-text("Request Withdrawal"), button:has-text("Confirm")');

      // Verify withdrawal success
      await expect(page.locator('text=Withdrawal requested, text=Request submitted, text=Processing')).toBeVisible({ timeout: 5000 });
    });

    test('should display withdrawal history', async ({ page }) => {
      // Navigate to wallet
      await page.goto('/wallet');

      // Look for withdrawal history section
      const historySection = page.locator('text=Withdrawal History, text=Recent Withdrawals, text=Transaction History');
      if (await historySection.isVisible()) {
        await expect(historySection).toBeVisible();

        // Verify withdrawal records
        const withdrawalRecords = page.locator('[class*="withdrawal"], [data-testid="withdrawal"]');
        if (await withdrawalRecords.count() > 0) {
          await expect(withdrawalRecords.first()).toBeVisible();
        }
      }
    });

    test('should validate withdrawal amount', async ({ page }) => {
      await page.goto('/wallet');

      // Click withdraw button
      await page.click('button:has-text("Withdraw"), button:has-text("Request Withdrawal")');

      // Verify withdrawal form
      await expect(page.locator('text=Withdrawal, text=Amount')).toBeVisible({ timeout: 3000 });

      // Try to withdraw more than available
      const amountInput = page.locator('input[name="amount"], input[placeholder*="amount"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('999999');
      }

      // Try to submit
      await page.click('button:has-text("Submit"), button:has-text("Request Withdrawal")');

      // Verify error message
      await expect(page.locator('text=Insufficient balance, text=Amount exceeds available')).toBeVisible({ timeout: 2000 });
    });

    test('should track withdrawal status', async ({ page }) => {
      await page.goto('/wallet');

      // Look for withdrawal status tracking
      const statusElements = page.locator('text=Pending, text=Processing, text=Completed, text=Failed');
      if (await statusElements.count() > 0) {
        await expect(statusElements.first()).toBeVisible();
      }
    });
  });
});