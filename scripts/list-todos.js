#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.next', '.git', '.archive'];
const TODO_REGEX = /(?:TODO|FIXME|HACK|XXX|REVIEW)[:\s]?(.+)?/i;

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.includes(entry.name)) continue;
      walk(full, cb);
    } else if (entry.isFile()) {
      cb(full);
    }
  }
}

function main() {
  const todos = [];
  walk(process.cwd(), (file) => {
    const rel = path.relative(process.cwd(), file);
    if (rel.startsWith('node_modules') || rel.startsWith('.git') || rel.includes('/node_modules/')) return;
    // only scan code and docs
    if (!/\.(js|ts|tsx|py|md|sql|sh|ps1|json)$/.test(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    lines.forEach((line, i) => {
      const match = line.match(TODO_REGEX);
      if (match) {
        todos.push({ file: rel, line: i + 1, text: line.trim() });
      }
    });
  });

  todos.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  const out = ['# TODOs Report', '', `Found: ${todos.length} items`, '', '| File | Line | Comment |', '| ---- | ---- | ------- |'];
  todos.forEach(t => {
    out.push(`| ${t.file} | ${t.line} | ${t.text.replace(/\|/g, '\\|')} |`);
  });

  fs.writeFileSync('TODO-REPORT.md', out.join('\n'));
  console.log(`Generated TODO-REPORT.md with ${todos.length} items`);
}

main();
