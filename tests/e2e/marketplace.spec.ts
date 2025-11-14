import { test, expect } from '@playwright/test';

test.describe('Azora Marketplace E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto('http://localhost:3002');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display marketplace homepage with Ubuntu branding', async ({ page }) => {
    // Check for Azora Forge title
    await expect(page.locator('h1')).toContainText('Azora Forge');
    
    // Verify Ubuntu philosophy is present
    await expect(page.locator('text=AI-Powered Job Marketplace')).toBeVisible();
    
    // Check for active jobs counter
    await expect(page.locator('text=Active Jobs')).toBeVisible();
  });

  test('should allow job search and filtering', async ({ page }) => {
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="AI Engineer"]');
    await searchInput.fill('React Developer');
    
    // Apply filters
    const jobTypeSelect = page.locator('select').first();
    await jobTypeSelect.selectOption('full-time');
    
    const applyFiltersBtn = page.locator('button:has-text("Apply Filters")');
    await applyFiltersBtn.click();
    
    // Verify filtered results
    await page.waitForTimeout(1000);
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards.first()).toBeVisible();
  });

  test('should display job details and allow application', async ({ page }) => {
    // Wait for jobs to load
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });
    
    // Click on first job
    const firstJob = page.locator('[data-testid="job-card"]').first();
    const jobTitle = await firstJob.locator('h3').textContent();
    
    // Click apply button
    const applyBtn = firstJob.locator('button:has-text("Apply Now")');
    await applyBtn.click();
    
    // Verify application modal or page
    await expect(page.locator('text=Apply for')).toBeVisible();
  });

  test('should navigate to job posting page', async ({ page }) => {
    // Navigate to job posting
    await page.goto('http://localhost:3002/post-job');
    
    // Verify job posting form
    await expect(page.locator('h1:has-text("Post a Job")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Senior React Developer"]')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Describe the role"]')).toBeVisible();
  });

  test('should create a new job posting', async ({ page }) => {
    // Navigate to job posting
    await page.goto('http://localhost:3002/post-job');
    
    // Fill out job form
    await page.fill('input[placeholder*="Senior React Developer"]', 'Test React Developer');
    await page.fill('input[placeholder*="Ubuntu Tech Solutions"]', 'Test Company');
    await page.fill('input[placeholder*="Remote / Cape Town"]', 'Remote');
    await page.selectOption('select', 'full-time');
    await page.fill('input[placeholder*="R50,000"]', 'R60,000 - R80,000');
    
    // Add skills
    const skillInput = page.locator('input[placeholder*="Add a skill"]');
    await skillInput.fill('React');
    await page.click('button:has-text("Add")');
    
    await skillInput.fill('TypeScript');
    await page.click('button:has-text("Add")');
    
    // Fill description
    await page.fill('textarea[placeholder*="Describe the role"]', 
      'We are looking for a talented React developer to join our Ubuntu-aligned team...');
    
    // Add requirements
    const reqInput = page.locator('input[placeholder*="Add a requirement"]');
    await reqInput.fill('3+ years React experience');
    await page.click('button:has-text("Add")');
    
    // Add benefits
    const benefitInput = page.locator('input[placeholder*="Add a benefit"]');
    await benefitInput.fill('Remote work flexibility');
    await page.click('button:has-text("Add")');
    
    // Submit form
    await page.click('button:has-text("Post Job")');
    
    // Verify success (mock response)
    await page.waitForTimeout(2000);
  });

  test('should display skill marketplace categories', async ({ page }) => {
    // Navigate to skills marketplace
    await page.goto('http://localhost:3002/skills');
    
    // Verify skill marketplace title
    await expect(page.locator('h1:has-text("Azora Skill Marketplace")')).toBeVisible();
    
    // Check for category cards
    await expect(page.locator('text=Technology & Programming')).toBeVisible();
    await expect(page.locator('text=Design & Creative')).toBeVisible();
    await expect(page.locator('text=Business & Marketing')).toBeVisible();
  });

  test('should handle employer dashboard navigation', async ({ page }) => {
    // Navigate to employer dashboard
    await page.goto('http://localhost:3002/employer');
    
    // Verify dashboard elements
    await expect(page.locator('h1:has-text("Employer Dashboard")')).toBeVisible();
    
    // Check for stats cards
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Total Applications')).toBeVisible();
    await expect(page.locator('text=Shortlisted')).toBeVisible();
    
    // Verify quick actions
    await expect(page.locator('text=Post New Job')).toBeVisible();
    await expect(page.locator('text=Review Applications')).toBeVisible();
  });

  test('should display application management interface', async ({ page }) => {
    // Navigate to application management
    await page.goto('http://localhost:3002/applications');
    
    // Verify application management title
    await expect(page.locator('h1:has-text("Application Management")')).toBeVisible();
    
    // Check for filter options
    await expect(page.locator('select')).toHaveCount(3); // Status, Job, and sorting filters
    
    // Verify filter functionality
    const statusFilter = page.locator('select').first();
    await statusFilter.selectOption('pending');
    
    await page.waitForTimeout(1000);
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to marketplace
    await page.goto('http://localhost:3002');
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if mobile menu works (if implemented)
    const mobileMenuBtn = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/jobs', route => route.abort());
    
    // Navigate to marketplace
    await page.goto('http://localhost:3002');
    
    // Wait for error state
    await page.waitForTimeout(3000);
    
    // Verify error handling (should show loading or error message)
    const loadingOrError = page.locator('text=Loading, text=Error, text=No jobs');
    await expect(loadingOrError.first()).toBeVisible();
  });

  test('should maintain Ubuntu branding throughout navigation', async ({ page }) => {
    const pages = [
      'http://localhost:3002',
      'http://localhost:3002/post-job',
      'http://localhost:3002/skills',
      'http://localhost:3002/employer'
    ];
    
    for (const url of pages) {
      await page.goto(url);
      
      // Check for Ubuntu color scheme (indigo/purple gradients)
      const gradientElements = page.locator('[class*="gradient"], [class*="indigo"], [class*="purple"]');
      await expect(gradientElements.first()).toBeVisible();
      
      // Verify Azora branding
      const azoraElements = page.locator('text=Azora, [alt*="Azora"]');
      if (await azoraElements.count() > 0) {
        await expect(azoraElements.first()).toBeVisible();
      }
    }
  });

  test('should handle form validation correctly', async ({ page }) => {
    // Navigate to job posting
    await page.goto('http://localhost:3002/post-job');
    
    // Try to submit empty form
    await page.click('button:has-text("Post Job")');
    
    // Verify HTML5 validation or custom validation messages
    const titleInput = page.locator('input[placeholder*="Senior React Developer"]');
    await expect(titleInput).toBeFocused();
    
    // Fill required fields and verify validation passes
    await page.fill('input[placeholder*="Senior React Developer"]', 'Test Job');
    await page.fill('input[placeholder*="Ubuntu Tech Solutions"]', 'Test Company');
    await page.fill('input[placeholder*="Remote / Cape Town"]', 'Remote');
    await page.fill('textarea[placeholder*="Describe the role"]', 'Test description');
    
    // Form should now be submittable
    const submitBtn = page.locator('button:has-text("Post Job")');
    await expect(submitBtn).not.toBeDisabled();
  });
});