/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import os from 'os';

function run(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString();
  } catch (e: any) {
    return e?.stdout?.toString?.() || '';
  }
}

function changed(): boolean {
  const out = run('git status --porcelain');
  return out.trim().length > 0;
}

function commitAndPush(message: string) {
  run('git add -A');
  const diff = run('git status --porcelain');
  if (!diff.trim()) return;
  // Write message to a temporary file to avoid shell escaping issues
  const tmpPath = join(os.tmpdir(), `azora-commit-${Date.now()}.txt`);
  try {
    writeFileSync(tmpPath, message, { encoding: 'utf8' });
    run(`git commit -F "${tmpPath}"`);
  } finally {
    try { unlinkSync(tmpPath); } catch {}
  }
  run('git push origin clean-branch');
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function loop() {
  const ingestIntervalMs = Number(process.env.INGEST_INTERVAL_MS || 5 * 60 * 1000); // 5m
  const fundingIntervalMs = Number(process.env.FUNDING_INTERVAL_MS || 15 * 60 * 1000); // 15m

  let lastIngest = 0;
  let lastFunding = 0;

  while (true) {
    const now = Date.now();

    if (now - lastIngest >= ingestIntervalMs) {
      console.log('[auto] Running research:ingest');
      run('npm run research:ingest');
      if (changed()) commitAndPush('chore(research): auto-ingest findings');
      lastIngest = now;
    }

    if (now - lastFunding >= fundingIntervalMs) {
      console.log('[auto] Running funding:report');
      run('npm run funding:report');
      // funding report is informational; do not commit stdout
      lastFunding = now;
    }

    await sleep(10_000);
  }
}

loop();


