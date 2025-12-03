import { test, expect, Page } from '@playwright/test';

test.describe('Complete User Journey - Student Success Path', () => {
  let page: Page;
  const testEmail = `student-${Date.now()}@test.azora`;
  const testPassword = 'Test123!@#';

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('1. User Registration', async () => {
    await page.goto('/signup');
    
    // Fill registration form
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'Student');
    await page.fill('[name="email"]', testEmail);
    await page.fill('[name="password"]', testPassword);
    await page.fill('[name="confirmPassword"]', testPassword);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    
    // Verify welcome message
    await expect(page.locator('text=Welcome, Test')).toBeVisible();
  });

  test('2. Browse and Enroll in Course', async () => {
    // Navigate to courses
    await page.click('text=Browse Courses');
    await expect(page).toHaveURL(/\/courses/);
    
    // Search for Python course
    await page.fill('[placeholder*="Search"]', 'Python');
    await page.press('[placeholder*="Search"]', 'Enter');
    
    // Select first course
    await page.click('.course-card:first-child');
    
    // Verify course details page
    await expect(page.locator('h1')).toContainText('Python');
    
    // Enroll in course
    await page.click('button:has-text("Enroll Now")');
    
    // Verify enrollment success
    await expect(page.locator('text=Successfully enrolled')).toBeVisible({ timeout: 3000 });
    
    // Verify "Start Learning" button appears
    await expect(page.locator('button:has-text("Start Learning")')).toBeVisible();
  });

  test('3. Complete First Lesson', async () => {
    // Start learning
    await page.click('button:has-text("Start Learning")');
    
    // Verify lesson content loads
    await expect(page.locator('.lesson-content')).toBeVisible({ timeout: 5000 });
    
    // Read lesson content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Mark lesson as complete
    await page.click('button:has-text("Mark Complete")');
    
    // Verify completion
    await expect(page.locator('text=Lesson completed')).toBeVisible({ timeout: 3000 });
    
    // Verify progress updated
    const progress = await page.locator('.progress-bar').getAttribute('aria-valuenow');
    expect(parseInt(progress || '0')).toBeGreaterThan(0);
  });

  test('4. Interact with AI Tutor (Elara)', async () => {
    // Open AI tutor
    await page.click('[data-testid="ai-tutor-button"]');
    
    // Verify Elara appears
    await expect(page.locator('text=Elara')).toBeVisible();
    
    // Ask a question
    const question = 'Can you explain Python variables?';
    await page.fill('[name="question"]', question);
    await page.click('button:has-text("Ask")');
    
    // Wait for AI response
    await expect(page.locator('.ai-response')).toBeVisible({ timeout: 10000 });
    
    // Verify response quality
    const response = await page.locator('.ai-response').textContent();
    expect(response).toBeTruthy();
    expect(response!.length).toBeGreaterThan(50);
    expect(response!.toLowerCase()).toContain('variable');
  });

  test('5. Check AZR Token Balance', async () => {
    // Navigate to wallet
    await page.click('text=Wallet');
    await expect(page).toHaveURL(/\/wallet/);
    
    // Verify AZR balance
    const balance = await page.locator('[data-testid="azr-balance"]').textContent();
    expect(balance).toBeTruthy();
    
    // Parse balance (should be > 0 after completing lesson)
    const balanceValue = parseFloat(balance!.replace(/[^0-9.]/g, ''));
    expect(balanceValue).toBeGreaterThan(0);
    
    // Verify transaction history
    await expect(page.locator('.transaction-item')).toHaveCount(1, { timeout: 3000 });
  });

  test('6. Explore Job Marketplace', async () => {
    // Navigate to marketplace
    await page.click('text=Jobs');
    await expect(page).toHaveURL(/\/marketplace/);
    
    // Search for Python jobs
    await page.fill('[placeholder*="Search jobs"]', 'Python Developer');
    await page.press('[placeholder*="Search jobs"]', 'Enter');
    
    // Verify job listings
    await expect(page.locator('.job-card')).toHaveCount(1, { timeout: 5000 });
    
    // Click on first job
    await page.click('.job-card:first-child');
    
    // Verify job details
    await expect(page.locator('h1')).toContainText('Python');
  });

  test('7. Update Profile', async () => {
    // Navigate to profile
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Profile');
    
    // Update bio
    await page.fill('[name="bio"]', 'Aspiring Python developer learning on Azora OS');
    
    // Add skill
    await page.click('button:has-text("Add Skill")');
    await page.fill('[name="skill"]', 'Python');
    await page.selectOption('[name="skillLevel"]', 'beginner');
    await page.click('button:has-text("Save Skill")');
    
    // Save profile
    await page.click('button:has-text("Save Profile")');
    
    // Verify success
    await expect(page.locator('text=Profile updated')).toBeVisible({ timeout: 3000 });
  });

  test('8. Logout', async () => {
    // Open user menu
    await page.click('[data-testid="user-menu"]');
    
    // Click logout
    await page.click('text=Logout');
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    
    // Verify logout message
    await expect(page.locator('text=Successfully logged out')).toBeVisible();
  });
});

test.describe('Performance Checks', () => {
  test('Page load times are acceptable', async ({ page }) => {
    const pages = [
      { url: '/', name: 'Home' },
      { url: '/courses', name: 'Courses' },
      { url: '/marketplace', name: 'Marketplace' },
    ];

    for (const { url, name } of pages) {
      const startTime = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - startTime;
      
      console.log(`${name} page loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
    }
  });
});

test.describe('Accessibility Checks', () => {
  test('Key pages are accessible', async ({ page }) => {
    const pages = ['/', '/courses', '/marketplace'];

    for (const url of pages) {
      await page.goto(url);
      
      // Check for proper heading structure
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });
});
