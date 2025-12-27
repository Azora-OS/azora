import { chromium, FullConfig } from '@playwright/test';
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as net from 'net'
import * as path from 'path'

async function waitForPort(port: number, timeout = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const sock = net.connect(port, '127.0.0.1')
        sock.on('connect', () => { sock.end(); res(null) })
        sock.on('error', () => rej(new Error('not ready')))
      })
      return
    } catch (e) {
      await new Promise((r) => setTimeout(r, 200))
    }
  }
  throw new Error(`Port ${port} not ready`)
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  // Start y-websocket server for real-time tests
  try {
    const serverProc = spawn('node', ['services/y-websocket/index.js'], {
      cwd: process.cwd(),
      env: process.env,
      detached: true,
      stdio: 'ignore',
    })
    // write pid to tmp file so globalTeardown can kill it
    const tmpDir = path.join(process.cwd(), '.tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    fs.writeFileSync(path.join(tmpDir, 'y-websocket.pid'), String(serverProc.pid))
    serverProc.unref()

    // wait for port 1234 to be ready
    await waitForPort(1234, 10000)
  } catch (e) {
    // don't block tests if the server can't start; tests that rely on it will fail explicitly
    console.warn('y-websocket server failed to start in global setup:', e)
  }

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
