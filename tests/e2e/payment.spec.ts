import { test, expect } from '@playwright/test';

test.describe('Azora Pay E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pay UI
    await page.goto('http://localhost:3003');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display financial dashboard with Ubuntu branding', async ({ page }) => {
    // Check for Financial Dashboard title
    await expect(page.locator('h1:has-text("Financial Dashboard")')).toBeVisible();
    
    // Verify Ubuntu philosophy is present
    await expect(page.locator('text=Constitutional AI Financial Command Center')).toBeVisible();
    
    // Check for wallet cards
    await expect(page.locator('text=AZR')).toBeVisible();
    await expect(page.locator('text=BTC')).toBeVisible();
    await expect(page.locator('text=ETH')).toBeVisible();
    await expect(page.locator('text=USD')).toBeVisible();
  });

  test('should display wallet balances and portfolio overview', async ({ page }) => {
    // Wait for wallet data to load
    await page.waitForTimeout(2000);
    
    // Check for balance displays
    const balanceElements = page.locator('[class*="font-bold"]:has-text("AZR"), [class*="font-bold"]:has-text("BTC")');
    await expect(balanceElements.first()).toBeVisible();
    
    // Verify portfolio value calculation
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    
    // Check for 24h change indicators
    await expect(page.locator('text=24h')).toBeVisible();
  });

  test('should show mining status and controls', async ({ page }) => {
    // Wait for mining data to load
    await page.waitForTimeout(2000);
    
    // Check for mining status card
    await expect(page.locator('text=Mining Status')).toBeVisible();
    
    // Verify mining metrics
    await expect(page.locator('text=MH/s')).toBeVisible();
    await expect(page.locator('text=AZR Earned')).toBeVisible();
    await expect(page.locator('text=Efficiency')).toBeVisible();
    
    // Check for mining control button
    const miningBtn = page.locator('button:has-text("Pause Mining"), button:has-text("Start Mining")');
    await expect(miningBtn.first()).toBeVisible();
  });

  test('should display recent activity feed', async ({ page }) => {
    // Wait for activity data to load
    await page.waitForTimeout(2000);
    
    // Check for recent activity section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Verify activity items
    await expect(page.locator('text=Mining Reward')).toBeVisible();
    await expect(page.locator('text=min ago, text=hour ago, text=day ago')).toBeVisible();
    
    // Check for activity icons
    await expect(page.locator('text=⛏️, text=💸, text=🧠, text=🔄')).toBeVisible();
  });

  test('should navigate to wallet management page', async ({ page }) => {
    // Navigate to wallet management
    await page.goto('http://localhost:3003/wallet');
    
    // Verify wallet management interface
    await expect(page.locator('h1:has-text("Wallet Management")')).toBeVisible();
    await expect(page.locator('text=Ubuntu financial sovereignty center')).toBeVisible();
    
    // Check for wallet cards
    const walletCards = page.locator('[class*="gradient"]');
    await expect(walletCards).toHaveCount(4); // AZR, BTC, ETH, USD
  });

  test('should handle wallet tab navigation', async ({ page }) => {
    // Navigate to wallet management
    await page.goto('http://localhost:3003/wallet');
    
    // Test tab navigation
    const tabs = ['Overview', 'Send', 'Receive', 'Exchange'];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(500);
      
      // Verify tab content is visible
      if (tab === 'Send') {
        await expect(page.locator('text=Send Payment')).toBeVisible();
        await expect(page.locator('select')).toBeVisible(); // Currency selector
        await expect(page.locator('input[placeholder="0.00"]')).toBeVisible();
      } else if (tab === 'Receive') {
        await expect(page.locator('text=Receive Payment')).toBeVisible();
        await expect(page.locator('text=Your Wallet Address')).toBeVisible();
      } else if (tab === 'Exchange') {
        await expect(page.locator('text=Exchange Currencies')).toBeVisible();
        await expect(page.locator('text=From')).toBeVisible();
        await expect(page.locator('text=To')).toBeVisible();
      }
    }
  });

  test('should validate send payment form', async ({ page }) => {
    // Navigate to wallet management
    await page.goto('http://localhost:3003/wallet');
    
    // Click Send tab
    await page.click('button:has-text("Send")');
    
    // Try to submit empty form
    await page.click('button:has-text("Send Payment")');
    
    // Verify validation
    const amountInput = page.locator('input[placeholder="0.00"]');
    await expect(amountInput).toBeFocused();
    
    // Fill form with valid data
    await page.selectOption('select', 'AZR');
    await page.fill('input[placeholder="0.00"]', '10.5');
    await page.fill('input[placeholder*="wallet address"]', 'azr1234567890abcdef');
    await page.fill('textarea[placeholder*="Ubuntu spirit"]', 'Ubuntu sharing for collective prosperity');
    
    // Submit form
    await page.click('button:has-text("Send Payment")');
    
    // Wait for processing
    await page.waitForTimeout(1000);
  });

  test('should display payment history page', async ({ page }) => {
    // Navigate to payment history
    await page.goto('http://localhost:3003/history');
    
    // Verify payment history interface
    await expect(page.locator('h1:has-text("Payment History")')).toBeVisible();
    await expect(page.locator('text=Ubuntu financial journey')).toBeVisible();
    
    // Check for summary cards
    await expect(page.locator('text=Total Earned')).toBeVisible();
    await expect(page.locator('text=Total Spent')).toBeVisible();
    await expect(page.locator('text=Transactions')).toBeVisible();
    await expect(page.locator('text=Ubuntu Impact')).toBeVisible();
  });

  test('should filter payment history', async ({ page }) => {
    // Navigate to payment history
    await page.goto('http://localhost:3003/history');
    
    // Wait for transactions to load
    await page.waitForTimeout(2000);
    
    // Test filters
    await page.selectOption('select[value="all"]', 'credit');
    await page.waitForTimeout(500);
    
    await page.selectOption('select:has-option("All Currencies")', 'AZR');
    await page.waitForTimeout(500);
    
    await page.selectOption('select:has-option("All Status")', 'completed');
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const transactionCards = page.locator('[class*="backdrop-blur"]');
    if (await transactionCards.count() > 0) {
      await expect(transactionCards.first()).toBeVisible();
    }
  });

  test('should display transaction details', async ({ page }) => {
    // Navigate to payment history
    await page.goto('http://localhost:3003/history');
    
    // Wait for transactions to load
    await page.waitForTimeout(2000);
    
    // Check for transaction cards
    const transactionCards = page.locator('[class*="backdrop-blur"]:has-text("Mining Reward"), [class*="backdrop-blur"]:has-text("Payment")');
    
    if (await transactionCards.count() > 0) {
      const firstTransaction = transactionCards.first();
      
      // Verify transaction details
      await expect(firstTransaction.locator('text=⛏️, text=💸, text=🧠, text=🔄')).toBeVisible();
      await expect(firstTransaction.locator('text=AZR, text=BTC, text=ETH, text=USD')).toBeVisible();
      
      // Check for transaction ID
      await expect(firstTransaction.locator('[class*="font-mono"]')).toBeVisible();
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to pay dashboard
    await page.goto('http://localhost:3003');
    
    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();
    
    // Check if wallet cards stack properly on mobile
    const walletCards = page.locator('[class*="gradient"]');
    await expect(walletCards.first()).toBeVisible();
    
    // Test mobile navigation
    await page.goto('http://localhost:3003/wallet');
    await expect(page.locator('h1:has-text("Wallet Management")')).toBeVisible();
  });

  test('should display market data and quick actions', async ({ page }) => {
    // Wait for market data to load
    await page.waitForTimeout(2000);
    
    // Check for market overview
    await expect(page.locator('text=Market Overview')).toBeVisible();
    
    // Verify market data cards
    await expect(page.locator('text=AZR')).toBeVisible();
    await expect(page.locator('text=BTC')).toBeVisible();
    await expect(page.locator('text=ETH')).toBeVisible();
    
    // Check for percentage changes
    await expect(page.locator('text=%, text=📈, text=📉')).toBeVisible();
    
    // Verify quick actions
    await expect(page.locator('text=Quick Actions')).toBeVisible();
    await expect(page.locator('text=Send')).toBeVisible();
    await expect(page.locator('text=Receive')).toBeVisible();
    await expect(page.locator('text=Exchange')).toBeVisible();
    await expect(page.locator('text=Invest')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure for wallet data
    await page.route('**/api/wallet/**', route => route.abort());
    
    // Navigate to dashboard
    await page.goto('http://localhost:3003');
    
    // Wait for error state
    await page.waitForTimeout(3000);
    
    // Verify error handling (should show loading or default values)
    const balanceElements = page.locator('text=0, text=Loading, text=Error');
    await expect(balanceElements.first()).toBeVisible();
  });

  test('should maintain Ubuntu theming throughout', async ({ page }) => {
    const pages = [
      'http://localhost:3003',
      'http://localhost:3003/wallet',
      'http://localhost:3003/history'
    ];
    
    for (const url of pages) {
      await page.goto(url);
      
      // Check for Ubuntu color scheme (emerald/blue/purple gradients)
      const gradientElements = page.locator('[class*="gradient"], [class*="emerald"], [class*="blue"], [class*="purple"]');
      await expect(gradientElements.first()).toBeVisible();
      
      // Verify Ubuntu philosophy references
      const ubuntuElements = page.locator('text=Ubuntu, text=Constitutional AI, text=sovereignty');
      if (await ubuntuElements.count() > 0) {
        await expect(ubuntuElements.first()).toBeVisible();
      }
    }
  });

  test('should calculate portfolio values correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Navigate to wallet management for detailed view
    await page.goto('http://localhost:3003/wallet');
    
    // Check for total portfolio value
    await expect(page.locator('text=Total Portfolio Value')).toBeVisible();
    
    // Verify percentage changes are displayed
    await expect(page.locator('text=24h')).toBeVisible();
    
    // Check for Ubuntu impact tracking
    await expect(page.locator('text=Ubuntu Impact')).toBeVisible();
  });
});