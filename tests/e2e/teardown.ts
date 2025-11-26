import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Cleanup test data
  await page.goto(`${baseURL}/api/test/teardown`);
  await page.evaluate(async () => {
    await fetch('/api/test/cleanup', { method: 'POST' });
  });
  
  await browser.close();
}

export default globalTeardown;
