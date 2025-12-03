#!/usr/bin/env node
// Simple pre-commit secret scanner: scans staged files for common secret keywords/patterns
const { execSync } = require('child_process');
const fs = require('fs');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (e) {
    console.error('Error getting staged files:', e.message);
    return [];
  }
}

const patterns = [
  /SUPABASE_ANON_KEY\s*=/i,
  /DATABASE_URL\s*=/i,
  /JWT_SECRET\s*=/i,
  /AWS_SECRET_ACCESS_KEY\s*=/i,
  /AWS_ACCESS_KEY_ID\s*=/i,
  /AKIA[0-9A-Z]{16}/,
  /sk_live_|sk_test_|sk_live\/|sk_test\//i,
  /xoxb-|xoxp-/i,
  /-----BEGIN RSA PRIVATE KEY|-----BEGIN PRIVATE KEY|-----BEGIN OPENSSH PRIVATE KEY/i,
  /client_secret\s*=/i,
  /SENTRY_DSN\s*=/i,
  /password\s*=/i,
  /passworD\s*:\s*/i
];

function scanContent(filePath, content) {
  const lines = content.split(/\r?\n/);
  const matches = [];
  lines.forEach((line, idx) => {
    for (const pat of patterns) {
      if (pat.test(line)) {
        matches.push({ line: idx + 1, text: line.trim(), pattern: pat.toString() });
      }
    }
  });
  return matches;
}

function main() {
  const staged = getStagedFiles();
  if (!staged.length) {
    process.exit(0);
  }

  let found = false;
  for (const f of staged) {
    // ignore binary blobs
    if (!fs.existsSync(f)) continue;
    let content = '';
    try {
      content = execSync(`git show :${f}`, { encoding: 'utf8' });
    } catch (e) {
      // fallback to reading from fs
      try { content = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    }
    const matches = scanContent(f, content);
    if (matches.length) {
      found = true;
      console.error(`\n🔐 Potential secret(s) found in staged file: ${f}`);
      matches.forEach(m => {
        console.error(`  Line ${m.line}: ${m.text}`);
      });
      console.error('  ———\n  Please remove secrets from this file and configure secrets using a secure mechanism (GitHub Secrets, Vault, etc.)\n');
    }
  }
  if (found) process.exit(1);
  process.exit(0);
}

main();

