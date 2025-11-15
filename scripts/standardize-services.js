#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '..', 'services');
const STANDARD_SCRIPTS = {
  dev: 'ts-node src/index.ts',
  build: 'tsc',
  start: 'node dist/index.js',
  test: 'jest',
  'test:watch': 'jest --watch',
  lint: 'eslint src',
  typecheck: 'tsc --noEmit'
};

const services = [
  'api-gateway',
  'auth-service',
  'azora-education',
  'azora-mint',
  'azora-forge',
  'azora-sapiens',
  'ai-family-service'
];

services.forEach(service => {
  const pkgPath = path.join(SERVICES_DIR, service, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.scripts = { ...pkg.scripts, ...STANDARD_SCRIPTS };
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ Standardized ${service}`);
  }
});

console.log('\n✅ All services standardized!');
