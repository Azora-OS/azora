import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';

// A small E2E test to verify cross-tab Yjs sync for the Collaboration Pod whiteboard.
// It starts the y-websocket server locally, opens two browser pages, types in one,
// and asserts the other receives the text.

test.describe('Collaboration Pod - Yjs cross-tab sync', () => {
  test('synchronizes textarea content across tabs', async ({ browser, baseURL }) => {
    // start y-websocket server only if not already running (global setup may have started it)
    const isPortOpen = (port: number) => new Promise<boolean>((resolve) => {
      const net = require('net')
      const sock = net.connect(port, '127.0.0.1')
      sock.on('connect', () => { sock.end(); resolve(true) })
      sock.on('error', () => resolve(false))
    })

    let proc: any = undefined
    const portOpen = await isPortOpen(1234)
    if (!portOpen) {
      proc = spawn('node', ['services/y-websocket/index.js'], { env: process.env });

      let started = false;
      const startPromise = new Promise<void>((resolve, reject) => {
        const onData = (chunk: Buffer) => {
          const s = chunk.toString();
          if (s.includes('y-websocket listening')) {
            started = true;
            resolve();
          }
        };
        proc.stdout?.on('data', onData);
        proc.stderr?.on('data', onData);

        // timeout
        setTimeout(() => {
          if (!started) {
            reject(new Error('y-websocket server did not start in time'));
          }
        }, 10000);
      });

      await startPromise;
    }

    try {
      const page1 = await browser.newPage();
      const page2 = await browser.newPage();

      await page1.goto(`${baseURL}/features/collaboration-pod`);
      await page2.goto(`${baseURL}/features/collaboration-pod`);

      // open whiteboards on both pages
      // click the Whiteboard's Open button specifically
      await page1.locator('h3', { hasText: 'Whiteboard' }).locator('..').getByRole('button', { name: /Open/i }).click();
      await page2.locator('h3', { hasText: 'Whiteboard' }).locator('..').getByRole('button', { name: /Open/i }).click();

      const ta1 = page1.locator('textarea');
      const ta2 = page2.locator('textarea');

      await ta1.waitFor({ state: 'visible' });
      await ta2.waitFor({ state: 'visible' });

      // presence: both pages should see each other in participants
      await expect(page1.locator('text=/\\d+ online/')).toHaveText(/2 online/, { timeout: 5000 })

      // type into page1 and assert page2 sees it
      const content = 'Hello from page1 - ' + Math.random().toString(36).slice(2, 8);
      await ta1.fill(content);

      // allow some time for sync
      await expect(ta2).toHaveValue(content, { timeout: 5000 });

      await page1.close();
      await page2.close();
    } finally {
      if (proc) proc.kill();
    }
  });
});
