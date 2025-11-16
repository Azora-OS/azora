/**
 * Playwright Setup and Global Configuration
 * 
 * Runs before all tests to set up test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test environment setup...');

  // Verify environment variables
  const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Wait for application to be ready
  console.log('⏳ Waiting for application to be ready...');
  const maxRetries = 30;
  let retries = 0;
  let isReady = false;

  while (retries < maxRetries && !isReady) {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      
      try {
        const response = await page.goto('http://localhost:3000', { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
        
        if (response?.ok()) {
          isReady = true;
          console.log('✅ Application is ready');
        }
      } catch (error) {
        // Application not ready yet
      } finally {
        await page.close();
        await browser.close();
      }
    } catch (error) {
      // Connection failed, retry
    }

    if (!isReady) {
      retries++;
      console.log(`⏳ Waiting for application... (attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (!isReady) {
    console.error('❌ Application failed to start within timeout');
    process.exit(1);
  }

  console.log('✅ E2E test environment setup complete');
}

export default globalSetup;
