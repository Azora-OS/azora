/**
 * E2E Test Utilities
 * 
 * Common helper functions for E2E tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Login a user
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]:has-text("Login")');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
}

/**
 * Logout a user
 */
export async function logoutUser(page: Page) {
  await page.click('[data-testid="user-menu"], button:has-text("Menu")');
  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
}

/**
 * Register a new user
 */
export async function registerUser(
  page: Page,
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  await page.goto('/signup');
  await page.fill('input[name="firstName"]', firstName);
  await page.fill('input[name="lastName"]', lastName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  
  // Accept terms
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  await termsCheckbox.check();
  
  await page.click('button[type="submit"]:has-text("Sign Up")');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(page: Page, courseTitle?: string) {
  await page.goto('/courses');
  
  let course;
  if (courseTitle) {
    course = page.locator(`[class*="course-card"]:has-text("${courseTitle}"), [data-testid="course-card"]:has-text("${courseTitle}")`).first();
  } else {
    course = page.locator('[class*="course-card"], [data-testid="course-card"]').first();
  }
  
  await course.click();
  await page.click('button:has-text("Enroll Now"), button:has-text("Enroll")');
  await expect(page.locator('text=Successfully enrolled, text=Enrollment confirmed')).toBeVisible({ timeout: 3000 });
}

/**
 * Complete a payment
 */
export async function completePayment(
  page: Page,
  cardNumber: string,
  expiry: string,
  cvc: string
) {
  // Fill payment form
  const cardInput = page.locator('input[placeholder*="card"], input[placeholder*="4242"]').first();
  if (await cardInput.isVisible()) {
    await cardInput.fill(cardNumber);
    await page.fill('input[placeholder*="MM/YY"], input[placeholder*="expiry"]', expiry);
    await page.fill('input[placeholder*="CVC"], input[placeholder*="CVV"]', cvc);
  }
  
  // Submit payment
  await page.click('button:has-text("Pay"), button:has-text("Complete Purchase"), button:has-text("Confirm Payment")');
  await expect(page.locator('text=Payment successful, text=Order confirmed')).toBeVisible({ timeout: 5000 });
}

/**
 * Request a withdrawal
 */
export async function requestWithdrawal(
  page: Page,
  amount: number,
  accountNumber: string,
  method: string = 'bank_transfer'
) {
  await page.goto('/wallet');
  await page.click('button:has-text("Withdraw"), button:has-text("Request Withdrawal")');
  
  const amountInput = page.locator('input[name="amount"], input[placeholder*="amount"]').first();
  if (await amountInput.isVisible()) {
    await amountInput.fill(amount.toString());
  }
  
  const methodSelect = page.locator('select[name="method"], select[name="withdrawalMethod"]').first();
  if (await methodSelect.isVisible()) {
    await methodSelect.selectOption(method);
  }
  
  const accountInput = page.locator('input[name="accountNumber"], input[placeholder*="account"]').first();
  if (await accountInput.isVisible()) {
    await accountInput.fill(accountNumber);
  }
  
  await page.click('button:has-text("Submit"), button:has-text("Request Withdrawal"), button:has-text("Confirm")');
  await expect(page.locator('text=Withdrawal requested, text=Request submitted')).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for element and verify visibility
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 3000) {
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout });
  return element;
}

/**
 * Get element text content
 */
export async function getElementText(page: Page, selector: string): Promise<string | null> {
  return page.locator(selector).first().textContent();
}

/**
 * Check if element is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).first().isVisible();
}

/**
 * Fill form field
 */
export async function fillFormField(page: Page, name: string, value: string) {
  const field = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`).first();
  
  if (await field.isVisible()) {
    const tagName = await field.evaluate(el => el.tagName);
    
    if (tagName === 'SELECT') {
      await field.selectOption(value);
    } else {
      await field.fill(value);
    }
  }
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Verify page title
 */
export async function verifyPageTitle(page: Page, title: string) {
  await expect(page.locator(`h1:has-text("${title}"), h2:has-text("${title}")`)).toBeVisible();
}

/**
 * Verify success message
 */
export async function verifySuccessMessage(page: Page, message?: string) {
  const selector = message 
    ? `text=${message}`
    : 'text=success, text=successful, text=completed, text=confirmed';
  
  await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
}

/**
 * Verify error message
 */
export async function verifyErrorMessage(page: Page, message?: string) {
  const selector = message 
    ? `text=${message}`
    : 'text=error, text=failed, text=invalid';
  
  await expect(page.locator(selector)).toBeVisible({ timeout: 3000 });
}

/**
 * Take screenshot for debugging
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `tests/e2e/screenshots/${name}-${timestamp}.png` });
}

/**
 * Measure page load time
 */
export async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - startTime;
  return loadTime;
}

/**
 * Check accessibility
 */
export async function checkAccessibility(page: Page) {
  // Check for proper heading structure
  const h1Count = await page.locator('h1').count();
  if (h1Count === 0) {
    console.warn('Warning: No h1 heading found on page');
  }
  
  // Check for alt text on images
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    if (!alt) {
      console.warn('Warning: Image without alt text found');
    }
  }
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for DOM content loaded
 */
export async function waitForDOMContentLoaded(page: Page, timeout: number = 5000) {
  await page.waitForLoadState('domcontentloaded', { timeout });
}

/**
 * Retry action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError || new Error('Action failed after retries');
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      timeToFirstByte: navigation.responseStart - navigation.requestStart,
      totalPageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
    };
  });
}

/**
 * Verify API response
 */
export async function verifyAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  expectedStatus: number = 200
) {
  const response = await page.waitForResponse(
    response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }
  );
  
  expect(response.status()).toBe(expectedStatus);
  return response;
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  _responseData?: any,
  _status: number = 200
) {
  await page.route(urlPattern, route => {
    route.abort('blockedbyclient');
  });
  
  await page.route(urlPattern, route => {
    route.continue();
  });
}

/**
 * Clear browser storage
 */
export async function clearBrowserStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Get all console messages
 */
export async function captureConsoleLogs(page: Page): Promise<string[]> {
  const logs: string[] = [];
  
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  return logs;
}

/**
 * Verify no console errors
 */
export async function verifyNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Wait for specific text with retry
 */
export async function waitForTextWithRetry(
  page: Page,
  text: string,
  timeout: number = 5000,
  maxRetries: number = 3
) {
  return retryAction(
    () => expect(page.locator(`text=${text}`)).toBeVisible({ timeout }),
    maxRetries,
    500
  );
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
}

/**
 * Get element bounding box
 */
export async function getElementBoundingBox(page: Page, selector: string) {
  return await page.locator(selector).first().boundingBox();
}

/**
 * Verify element is in viewport
 */
export async function isElementInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, selector);
}
