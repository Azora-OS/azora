import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Create test user
  await page.goto(`${baseURL}/api/test/setup`);
  await page.evaluate(async () => {
    await fetch('/api/test/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@azora.world',
        password: 'TestPass123!',
        name: 'Test User'
      })
    });
  });
  
  await browser.close();
}

export default globalSetup;
