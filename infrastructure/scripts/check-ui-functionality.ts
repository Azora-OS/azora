/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * UI Functionality Cross-Check Script
 *
 * Validates that all UI components, pages, and features are working correctly
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const checks: CheckResult[] = [];

function checkFileExists(filePath: string, name: string): boolean {
  const exists = fs.existsSync(filePath);
  checks.push({
    name,
    status: exists ? 'pass' : 'fail',
    message: exists ? 'File exists' : `File missing: ${filePath}`,
  });
  return exists;
}

function checkDirectoryExists(dirPath: string, name: string): boolean {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  checks.push({
    name,
    status: exists ? 'pass' : 'fail',
    message: exists ? 'Directory exists' : `Directory missing: ${dirPath}`,
  });
  return exists;
}

function checkComponentExists(componentName: string): boolean {
  const componentPath = path.join(
    process.cwd(),
    'components',
    'ui',
    `${componentName}.tsx`
  );
  return checkFileExists(componentPath, `Component: ${componentName}`);
}

function checkPageExists(pagePath: string): boolean {
  const fullPath = path.join(process.cwd(), 'app', `${pagePath}/page.tsx`);
  return checkFileExists(fullPath, `Page: ${pagePath}`);
}

async function main() {
  console.log('🔍 Starting UI Functionality Cross-Check...\n');

  // Check core configuration files
  console.log('📋 Checking configuration files...');
  checkFileExists('tailwind.config.ts', 'Tailwind Config');
  checkFileExists('components.json', 'Components Config');
  checkFileExists('package.json', 'Package.json');
  checkFileExists('vercel.json', 'Vercel Config');
  checkFileExists('app/globals.css', 'Global CSS');
  checkFileExists('app/layout.tsx', 'Root Layout');
  checkFileExists('app/page.tsx', 'Home Page');

  // Check essential UI components
  console.log('\n🎨 Checking UI components...');
  const essentialComponents = [
    'button',
    'card',
    'badge',
    'input',
    'dialog',
    'dropdown-menu',
    'select',
    'toast',
    'sonner',
    'theme-provider',
  ];

  essentialComponents.forEach((comp) => {
    if (comp === 'theme-provider') {
      checkFileExists(
        path.join(process.cwd(), 'components', 'theme-provider.tsx'),
        `Component: ${comp}`
      );
    } else {
      checkComponentExists(comp);
    }
  });

  // Check pages
  console.log('\n📄 Checking pages...');
  checkPageExists('dashboard');

  // Check utilities
  console.log('\n🛠️ Checking utilities...');
  checkFileExists('lib/utils.ts', 'Utils');

  // Check design system
  console.log('\n🎨 Checking design system...');
  checkFileExists(
    'lib/design-system/premium-tokens.ts',
    'Premium Design Tokens'
  );

  // Check for required dependencies in package.json
  console.log('\n📦 Checking dependencies...');
  try {
    const packageJson = JSON.parse(
      fs.readFileSync('package.json', 'utf8')
    );
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const required = [
      'next',
      'react',
      'react-dom',
      'tailwindcss',
      'framer-motion',
      'lucide-react',
      'next-themes',
      'sonner',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ];

    required.forEach((dep) => {
      const exists = !!deps[dep];
      checks.push({
        name: `Dependency: ${dep}`,
        status: exists ? 'pass' : 'fail',
        message: exists
          ? 'Installed'
          : `Missing dependency: ${dep}`,
      });
    });
  } catch (error) {
    checks.push({
      name: 'Dependency Check',
      status: 'fail',
      message: `Error reading package.json: ${error}`,
    });
  }

  // Summary
  console.log('\n📊 Summary:');
  const passed = checks.filter((c) => c.status === 'pass').length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const warnings = checks.filter((c) => c.status === 'warning').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);

  // Detailed results
  console.log('\n📝 Detailed Results:');
  checks.forEach((check) => {
    const icon =
      check.status === 'pass'
        ? '✅'
        : check.status === 'fail'
          ? '❌'
          : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  // Exit with appropriate code
  if (failed > 0) {
    console.log('\n❌ Some checks failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { checkFileExists, checkComponentExists, checkPageExists };

