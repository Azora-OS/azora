#!/usr/bin/env node
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

(async function main() {
  const entry = path.resolve(__dirname, 'ai-test-entry.ts');
  const out = path.resolve(__dirname, 'out-ai-test.mjs');

  try {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: out,
      sourcemap: 'inline',
      external: ['openai', '@anthropic-ai/sdk']
    });
  } catch (e) {
    console.error('esbuild failed:', e);
    process.exit(1);
  }

  const r = spawnSync('node', [out], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status);
})();
