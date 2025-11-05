/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Verify All Frontends Script
 *
 * Checks that all frontends are properly updated and functionality is preserved
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  name: string;
  hasThemeProvider: boolean;
  hasToaster: boolean;
  hasComponents: boolean;
  hasUtils: boolean;
  hasTokens: boolean;
  hasLayout: boolean;
  functionalityPreserved: boolean;
  errors: string[];
}

const NEXTJS_FRONTENDS = [
  'app',
  'synapse/academy-ui',
  'synapse/atlas-ui',
  'synapse/council-ui',
  'synapse/pulse-ui',
  'synapse/signal-ui',
  'synapse/vault-ui',
  'synapse/vigil-ui',
  'synapse/main-app',
  'elara-ide',
  'azora-ui',
  'ui',
];

const VITE_FRONTENDS = [
  'marketplace-ui',
  'pay-ui',
  'cloud-ui',
  'dev-ui',
  'enterprise-ui',
  'learn-ui',
  'compliance-ui',
];

function checkFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function checkFileContains(filePath: string, searchString: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

function verifyNextJSApp(appPath: string): VerificationResult {
  const fullPath = path.join(process.cwd(), appPath);
  const result: VerificationResult = {
    name: appPath,
    hasThemeProvider: false,
    hasToaster: false,
    hasComponents: false,
    hasUtils: false,
    hasTokens: false,
    hasLayout: false,
    functionalityPreserved: true,
    errors: [],
  };

  if (!fs.existsSync(fullPath)) {
    result.errors.push(`Directory not found: ${fullPath}`);
    return result;
  }

  // Check layout
  const layoutPath = path.join(fullPath, 'app', 'layout.tsx');
  if (checkFileExists(layoutPath)) {
    result.hasLayout = true;
    result.hasThemeProvider = checkFileContains(layoutPath, 'ThemeProvider');
    result.hasToaster = checkFileContains(layoutPath, 'Toaster');

    if (!result.hasThemeProvider) {
      result.errors.push('ThemeProvider not found in layout.tsx');
    }
    if (!result.hasToaster) {
      result.errors.push('Toaster not found in layout.tsx');
    }
  } else {
    result.errors.push('layout.tsx not found');
  }

  // Check components
  const componentsPath = path.join(fullPath, 'components', 'ui');
  result.hasComponents = checkFileExists(componentsPath);
  if (!result.hasComponents) {
    result.errors.push('UI components directory not found');
  }

  // Check theme provider
  const themeProviderPath = path.join(fullPath, 'components', 'theme-provider.tsx');
  if (!checkFileExists(themeProviderPath)) {
    result.errors.push('theme-provider.tsx not found');
  }

  // Check utils
  const utilsPath = path.join(fullPath, 'lib', 'utils.ts');
  result.hasUtils = checkFileExists(utilsPath);
  if (!result.hasUtils) {
    result.errors.push('lib/utils.ts not found');
  }

  // Check design tokens
  const tokensPath = path.join(fullPath, 'lib', 'design-system', 'premium-tokens.ts');
  result.hasTokens = checkFileExists(tokensPath);
  if (!result.hasTokens) {
    result.errors.push('Design tokens not found');
  }

  // Check if original functionality is preserved
  // This checks for key features that should remain
  const pagePath = path.join(fullPath, 'app', 'page.tsx');
  if (checkFileExists(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    // Check if page still has content (not empty)
    if (pageContent.trim().length < 50) {
      result.errors.push('Page appears to be empty or corrupted');
      result.functionalityPreserved = false;
    }
  }

  return result;
}

function verifyViteApp(appPath: string): VerificationResult {
  const fullPath = path.join(process.cwd(), appPath);
  const result: VerificationResult = {
    name: appPath,
    hasThemeProvider: false,
    hasToaster: false,
    hasComponents: false,
    hasUtils: false,
    hasTokens: false,
    hasLayout: false,
    functionalityPreserved: true,
    errors: [],
  };

  if (!fs.existsSync(fullPath)) {
    result.errors.push(`Directory not found: ${fullPath}`);
    return result;
  }

  // Check App.tsx
  const appPath_tsx = path.join(fullPath, 'src', 'App.tsx');
  if (checkFileExists(appPath_tsx)) {
    result.hasThemeProvider = checkFileContains(appPath_tsx, 'ThemeProvider');
    if (!result.hasThemeProvider) {
      // Check main.tsx instead
      const mainPath = path.join(fullPath, 'src', 'main.tsx');
      if (checkFileExists(mainPath)) {
        result.hasThemeProvider = checkFileContains(mainPath, 'ThemeProvider');
      }
      if (!result.hasThemeProvider) {
        result.errors.push('ThemeProvider not found in App.tsx or main.tsx');
      }
    }

    // Check if App.tsx still has its original functionality
    const appContent = fs.readFileSync(appPath_tsx, 'utf8');
    if (appContent.trim().length < 50) {
      result.errors.push('App.tsx appears to be empty or corrupted');
      result.functionalityPreserved = false;
    }
  } else {
    result.errors.push('App.tsx not found');
  }

  // Check components
  const componentsPath = path.join(fullPath, 'src', 'components', 'ui');
  result.hasComponents = checkFileExists(componentsPath);
  if (!result.hasComponents) {
    result.errors.push('UI components directory not found');
  }

  // Check theme provider
  const themeProviderPath = path.join(fullPath, 'src', 'components', 'theme-provider.tsx');
  if (!checkFileExists(themeProviderPath)) {
    result.errors.push('theme-provider.tsx not found');
  }

  // Check utils
  const utilsPath = path.join(fullPath, 'src', 'lib', 'utils.ts');
  result.hasUtils = checkFileExists(utilsPath);
  if (!result.hasUtils) {
    result.errors.push('lib/utils.ts not found');
  }

  // Check design tokens
  const tokensPath = path.join(fullPath, 'src', 'lib', 'design-system', 'premium-tokens.ts');
  result.hasTokens = checkFileExists(tokensPath);
  if (!result.hasTokens) {
    result.errors.push('Design tokens not found');
  }

  return result;
}

async function main() {
  console.log('🔍 Verifying All Frontends...\n');

  const results: VerificationResult[] = [];

  // Verify Next.js apps
  console.log('📦 Verifying Next.js Applications...\n');
  for (const app of NEXTJS_FRONTENDS) {
    const result = verifyNextJSApp(app);
    results.push(result);

    const status = result.errors.length === 0 ? '✅' : '❌';
    console.log(`${status} ${app}`);
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`   ⚠️  ${error}`));
    }
  }

  // Verify Vite apps
  console.log('\n📦 Verifying Vite Applications...\n');
  for (const app of VITE_FRONTENDS) {
    const result = verifyViteApp(app);
    results.push(result);

    const status = result.errors.length === 0 ? '✅' : '❌';
    console.log(`${status} ${app}`);
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`   ⚠️  ${error}`));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const total = results.length;
  const passed = results.filter(r => r.errors.length === 0).length;
  const failed = results.filter(r => r.errors.length > 0).length;

  console.log(`Total Apps: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  // Detailed breakdown
  console.log('\n📋 Detailed Breakdown:');
  results.forEach(result => {
    const checks = [
      result.hasThemeProvider ? '✅' : '❌',
      result.hasToaster ? '✅' : '❌',
      result.hasComponents ? '✅' : '❌',
      result.hasUtils ? '✅' : '❌',
      result.hasTokens ? '✅' : '❌',
      result.functionalityPreserved ? '✅' : '❌',
    ];
    console.log(`\n${result.name}:`);
    console.log(`  ThemeProvider: ${checks[0]}`);
    console.log(`  Toaster: ${checks[1]}`);
    console.log(`  Components: ${checks[2]}`);
    console.log(`  Utils: ${checks[3]}`);
    console.log(`  Tokens: ${checks[4]}`);
    console.log(`  Functionality: ${checks[5]}`);
  });

  if (failed > 0) {
    console.log('\n❌ Some verifications failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All frontends verified successfully!');
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { verifyNextJSApp, verifyViteApp };

