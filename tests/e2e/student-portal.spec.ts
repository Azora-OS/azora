import { test, expect } from '@playwright/test';

test.describe('Student Portal - Complete Learning Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should complete full learning journey', async ({ page }) => {
    // 1. Login
    await page.fill('[name="email"]', 'student@test.azora');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 2. Browse courses
    await page.click('text=Browse Courses');
    await expect(page).toHaveURL(/.*courses/);
    
    // 3. Enroll in course
    await page.click('text=Python Basics');
    await expect(page.locator('.course-title')).toContainText('Python');
    await page.click('button:has-text("Enroll Now")');
    
    // Verify enrollment success
    await expect(page.locator('.success-message')).toBeVisible();
    
    // 4. Start learning
    await page.click('text=Start Learning');
    await expect(page.locator('.lesson-content')).toBeVisible();
    
    // 5. Complete lesson
    await page.click('button:has-text("Mark Complete")');
    
    // 6. Verify AZR earned
    const balance = await page.locator('[data-testid="azr-balance"]').textContent();
    expect(parseFloat(balance || '0')).toBeGreaterThan(0);
  });

  test('should interact with AI tutor Elara', async ({ page }) => {
    // Login
    await page.fill('[name="email"]', 'student@test.azora');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Open AI tutor
    await page.click('[data-testid="ai-tutor-button"]');
    await expect(page.locator('.ai-tutor-modal')).toBeVisible();
    
    // Ask question
    await page.fill('[name="question"]', 'Explain variables in Python');
    await page.click('button:has-text("Ask Elara")');
    
    // Wait for AI response
    await expect(page.locator('.ai-response')).toBeVisible({ timeout: 10000 });
    
    // Verify response quality
    const response = await page.locator('.ai-response').textContent();
    expect(response?.length).toBeGreaterThan(50);
    expect(response).toContain('variable');
  });

  test('should track progress correctly', async ({ page }) => {
    // Login
    await page.fill('[name="email"]', 'student@test.azora');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Navigate to enrolled course
    await page.click('text=My Courses');
    await page.click('.course-card:first-child');
    
    // Check initial progress
    const initialProgress = await page.locator('[data-testid="progress-bar"]').getAttribute('aria-valuenow');
    
    // Complete a lesson
    await page.click('.lesson-item:first-child');
    await page.click('button:has-text("Mark Complete")');
    
    // Verify progress increased
    await page.goBack();
    const newProgress = await page.locator('[data-testid="progress-bar"]').getAttribute('aria-valuenow');
    expect(parseFloat(newProgress || '0')).toBeGreaterThan(parseFloat(initialProgress || '0'));
  });
});

test.describe('Student Portal - Navigation', () => {
  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'student@test.azora');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Test navigation
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    await page.click('text=Courses');
    await expect(page).toHaveURL(/.*courses/);
    
    await page.click('text=Profile');
    await expect(page).toHaveURL(/.*profile/);
    
    await page.click('text=Wallet');
    await expect(page).toHaveURL(/.*wallet/);
  });
});
