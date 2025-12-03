import { test, expect } from '@playwright/test'

// End-to-end workflow testing
test.describe('Azora OS Critical User Journeys', () => {
  
  test('Student Registration and Learning Flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('http://localhost:3000/register')
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'student@azora.es')
    await page.fill('[data-testid="password"]', 'SecurePass123!')
    await page.fill('[data-testid="name"]', 'Test Student')
    await page.click('[data-testid="register-button"]')
    
    // Verify registration success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    // Mock email verification (in real test, would check email)
    await page.goto('http://localhost:3000/verify-email?token=mock-token')
    await expect(page.locator('[data-testid="verification-success"]')).toBeVisible()
    
    // Login
    await page.goto('http://localhost:3000/login')
    await page.fill('[data-testid="email"]', 'student@azora.es')
    await page.fill('[data-testid="password"]', 'SecurePass123!')
    await page.click('[data-testid="login-button"]')
    
    // Verify dashboard access
    await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible()
    
    // Navigate to courses
    await page.click('[data-testid="courses-nav"]')
    await expect(page.locator('[data-testid="courses-list"]')).toBeVisible()
    
    // Enroll in a course
    await page.click('[data-testid="course-card"]:first-child')
    await page.click('[data-testid="enroll-button"]')
    await expect(page.locator('[data-testid="enrollment-success"]')).toBeVisible()
  })

  test('Payment Processing Flow', async ({ page }) => {
    // Login as existing user
    await page.goto('http://localhost:3000/login')
    await page.fill('[data-testid="email"]', 'user@azora.es')
    await page.fill('[data-testid="password"]', 'TestPass123!')
    await page.click('[data-testid="login-button"]')
    
    // Navigate to wallet
    await page.click('[data-testid="wallet-nav"]')
    await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible()
    
    // Initiate payment
    await page.click('[data-testid="send-payment"]')
    await page.fill('[data-testid="recipient-email"]', 'recipient@azora.es')
    await page.fill('[data-testid="amount"]', '50')
    await page.selectOption('[data-testid="currency"]', 'AZR')
    await page.click('[data-testid="send-button"]')
    
    // Verify payment confirmation
    await expect(page.locator('[data-testid="payment-success"]')).toBeVisible()
    
    // Check transaction history
    await page.click('[data-testid="transactions-tab"]')
    await expect(page.locator('[data-testid="transaction-list"] >> nth=0')).toContainText('50 AZR')
  })

  test('Marketplace Interaction Flow', async ({ page }) => {
    // Login as freelancer
    await page.goto('http://localhost:3000/login')
    await page.fill('[data-testid="email"]', 'freelancer@azora.es')
    await page.fill('[data-testid="password"]', 'FreelancePass123!')
    await page.click('[data-testid="login-button"]')
    
    // Navigate to marketplace
    await page.click('[data-testid="marketplace-nav"]')
    await expect(page.locator('[data-testid="job-listings"]')).toBeVisible()
    
    // Apply for a job
    await page.click('[data-testid="job-card"]:first-child')
    await page.click('[data-testid="apply-button"]')
    await page.fill('[data-testid="proposal"]', 'I am interested in this project...')
    await page.fill('[data-testid="bid-amount"]', '500')
    await page.click('[data-testid="submit-proposal"]')
    
    // Verify application submitted
    await expect(page.locator('[data-testid="application-success"]')).toBeVisible()
  })

  test('Admin Dashboard Access', async ({ page }) => {
    // Login as admin
    await page.goto('http://localhost:3000/login')
    await page.fill('[data-testid="email"]', 'admin@azora.es')
    await page.fill('[data-testid="password"]', 'AdminPass123!')
    await page.click('[data-testid="login-button"]')
    
    // Access admin dashboard
    await page.click('[data-testid="admin-nav"]')
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
    
    // Check system metrics
    await expect(page.locator('[data-testid="user-count"]')).toBeVisible()
    await expect(page.locator('[data-testid="transaction-volume"]')).toBeVisible()
    await expect(page.locator('[data-testid="system-health"]')).toContainText('Healthy')
  })

  test('Mobile Responsive Design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Test mobile navigation
    await page.goto('http://localhost:3000')
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    
    // Test mobile forms
    await page.click('[data-testid="login-nav"]')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    
    // Verify mobile-optimized layout
    const loginForm = page.locator('[data-testid="login-form"]')
    await expect(loginForm).toHaveCSS('width', '100%')
  })
})

// Performance testing
test.describe('Performance Tests', () => {
  test('Page Load Performance', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('http://localhost:3000')
    const loadTime = Date.now() - startTime
    
    // Verify page loads within 2 seconds
    expect(loadTime).toBeLessThan(2000)
    
    // Check for performance metrics
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'))
    })
    
    const navigation = JSON.parse(performanceEntries)[0]
    expect(navigation.loadEventEnd - navigation.loadEventStart).toBeLessThan(1000)
  })

  test('API Response Times', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Monitor network requests
    const responses: number[] = []
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push(response.timing().responseEnd)
      }
    })
    
    // Trigger API calls
    await page.click('[data-testid="dashboard-nav"]')
    await page.waitForTimeout(2000)
    
    // Verify API response times
    responses.forEach(responseTime => {
      expect(responseTime).toBeLessThan(500) // 500ms threshold
    })
  })
})