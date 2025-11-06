#!/usr/bin/env node

/**
 * Generate README.md for services missing documentation
 * Usage: node scripts/generate-service-readme.js <service-name>
 */

const fs = require('fs');
const path = require('path');

const serviceName = process.argv[2];
if (!serviceName) {
  console.error('Usage: node generate-service-readme.js <service-name>');
  process.exit(1);
}

const servicePath = path.join(__dirname, '..', 'services', serviceName);
if (!fs.existsSync(servicePath)) {
  console.error(`Service directory not found: ${servicePath}`);
  process.exit(1);
}

// Check if README already exists
const readmePath = path.join(servicePath, 'README.md');
if (fs.existsSync(readmePath)) {
  console.log(`README.md already exists for ${serviceName}`);
  process.exit(0);
}

// Check for package.json to get description
let description = `${serviceName} service`;
let version = '1.0.0';
const packageJsonPath = path.join(servicePath, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    description = pkg.description || description;
    version = pkg.version || version;
  } catch (e) {
    // Ignore parse errors
  }
}

// Generate README template
const readmeTemplate = `# ${serviceName}

${description}

## Overview

This service is part of the Azora OS ecosystem.

## Features

- [Add service features here]

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Configuration

Configure the service using environment variables or configuration files.

## API

[Document API endpoints here]

## License

AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
`;

fs.writeFileSync(readmePath, readmeTemplate);
console.log(`Generated README.md for ${serviceName}`);
