import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs'
import * as path from 'path'

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

  // Kill y-websocket if we started it in setup
  try {
    const pidPath = path.join(process.cwd(), '.tmp', 'y-websocket.pid')
    if (fs.existsSync(pidPath)) {
      const pid = Number(fs.readFileSync(pidPath, 'utf8'))
      try {
        process.kill(pid)
      } catch (e) {
        // ignore if already dead
      }
      fs.unlinkSync(pidPath)
    }
  } catch (e) {
    console.warn('Error during global teardown (y-websocket kill):', e)
  }
}

export default globalTeardown;
