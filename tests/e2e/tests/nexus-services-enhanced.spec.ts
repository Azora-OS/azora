/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

ENHANCED PLAYWRIGHT TEST WITH SESSION CAPTURE
Example integration of enhanced E2E testing with Playwright
*/

import { test, expect } from '@playwright/test';
import { e2eTestRunner, FrictionType } from '../../tools/e2e-enhancer';

test.describe('Azora Nexus Services E2E Tests - Enhanced', () => {
  test('should test services with session capture', async ({ page, request }) => {
    // Start session capture
    const session = e2eTestRunner.startSessionCapture('nexus-services-test');

    try {
      // Navigate to service
      await page.goto('http://localhost:3000');
      e2eTestRunner.recordUserAction(session, 'navigate', 'success', 'page');

      // Test wallet service
      const walletResponse = await request.get('http://localhost:4100/health');
      const walletResponseTime = walletResponse.timing().responseEnd - walletResponse.timing().requestStart;
      
      e2eTestRunner.recordAPICall(
        session,
        '/api/wallet/health',
        'GET',
        walletResponse.status(),
        walletResponseTime,
        false // Check if mock
      );

      if (!walletResponse.ok()) {
        e2eTestRunner.recordFrictionPoint(session, {
          type: FrictionType.ERROR_MESSAGE,
          testName: session.testName,
          page: '/api/wallet/health',
          apiEndpoint: '/api/wallet/health',
          severity: 'high',
          description: `Wallet service health check failed: ${walletResponse.status()}`,
        });
      }

      // Test blockchain service
      const blockchainResponse = await request.get('http://localhost:4101/health');
      const blockchainResponseTime = blockchainResponse.timing().responseEnd - blockchainResponse.timing().requestStart;
      
      e2eTestRunner.recordAPICall(
        session,
        '/api/blockchain/health',
        'GET',
        blockchainResponse.status(),
        blockchainResponseTime,
        false
      );

      // Check for missing APIs (e.g., useApi hooks)
      try {
        await page.evaluate(() => {
          // Try to access hooks that might be missing
          if (typeof window !== 'undefined' && !window.useWalletBalance) {
            throw new Error('useWalletBalance hook not found');
          }
        });
      } catch (error: any) {
        e2eTestRunner.recordFrictionPoint(session, {
          type: FrictionType.MISSING_API,
          testName: session.testName,
          page: 'dashboard',
          element: 'useWalletBalance',
          severity: 'high',
          description: 'Missing useWalletBalance hook - frontend expects this API',
        });
      }

      // Capture screenshot
      await e2eTestRunner.captureScreenshot(session, page, 'test-complete');

      expect(walletResponse.ok()).toBeTruthy();
      expect(blockchainResponse.ok()).toBeTruthy();

    } catch (error: any) {
      // Record error as friction point
      e2eTestRunner.recordFrictionPoint(session, {
        type: FrictionType.ERROR_MESSAGE,
        testName: session.testName,
        page: page.url(),
        error: error.message,
        severity: 'critical',
        description: `Test failed: ${error.message}`,
      });

      await e2eTestRunner.captureScreenshot(session, page, 'error-state');
      throw error;
    } finally {
      // End session capture
      e2eTestRunner.endSessionCapture(session);
    }
  });

  test('should detect mock data and missing APIs', async ({ page, request }) => {
    const session = e2eTestRunner.startSessionCapture('mock-detection-test');

    try {
      // Test an endpoint that might return mocks
      const response = await request.get('http://localhost:4000/api/retail-ai/inventory');
      const data = await response.json();

      // Check if response contains mock indicators
      const responseStr = JSON.stringify(data).toLowerCase();
      const mockIndicators = ['mock', 'todo', 'sample', 'placeholder', 'not implemented'];

      const isMock = mockIndicators.some(indicator => responseStr.includes(indicator));

      if (isMock) {
        e2eTestRunner.recordFrictionPoint(session, {
          type: FrictionType.MOCK_DATA,
          testName: session.testName,
          page: '/api/retail-ai/inventory',
          apiEndpoint: '/api/retail-ai/inventory',
          severity: 'medium',
          description: 'API endpoint is returning mock data instead of real data',
        });
      }

      e2eTestRunner.recordAPICall(
        session,
        '/api/retail-ai/inventory',
        'GET',
        response.status(),
        response.timing().responseEnd - response.timing().requestStart,
        isMock
      );

    } finally {
      e2eTestRunner.endSessionCapture(session);
    }
  });
});

// After all tests, generate backlog report
test.afterAll(async () => {
  const reportPath = e2eTestRunner.generateBacklogReport();
  console.log(`📋 Backlog report generated: ${reportPath}`);
});
