/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Update All Frontends Script
 *
 * Ensures all frontend applications have the premium UI overhaul
 */

import * as fs from 'fs';
import * as path from 'path';

interface FrontendApp {
  name: string;
  path: string;
  type: 'nextjs' | 'vite' | 'other';
  hasComponents: boolean;
  hasLayout: boolean;
  hasGlobals: boolean;
}

const frontends: FrontendApp[] = [
  // Main App
  { name: 'Main App', path: 'app', type: 'nextjs', hasComponents: true, hasLayout: true, hasGlobals: true },

  // Synapse Apps
  { name: 'Synapse Academy', path: 'synapse/academy-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Atlas', path: 'synapse/atlas-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Council', path: 'synapse/council-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Pulse', path: 'synapse/pulse-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Signal', path: 'synapse/signal-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Vault', path: 'synapse/vault-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Vigil', path: 'synapse/vigil-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Main App', path: 'synapse/main-app', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Synapse Frontend', path: 'synapse/frontend', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },

  // UI Apps
  { name: 'UI', path: 'ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Cloud UI', path: 'cloud-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Compliance UI', path: 'compliance-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Dev UI', path: 'dev-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Enterprise UI', path: 'enterprise-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Learn UI', path: 'learn-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },

  // Other Apps
  { name: 'Elara IDE', path: 'elara-ide', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Marketplace UI', path: 'marketplace-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Pay UI', path: 'pay-ui', type: 'vite', hasComponents: false, hasLayout: false, hasGlobals: true },
  { name: 'Azora UI', path: 'azora-ui', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Azora Mint Mine', path: 'azora-mint-mine-engine-next', type: 'nextjs', hasComponents: false, hasLayout: true, hasGlobals: true },
  { name: 'Ingestion UI', path: 'ingestion-ui', type: 'nextjs', hasComponents: true, hasLayout: true, hasGlobals: true },
];

const results: { name: string; status: 'success' | 'skipped' | 'error'; message: string }[] = [];

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyFile(source: string, dest: string): boolean {
  try {
    if (fs.existsSync(source)) {
      ensureDir(path.dirname(dest));
      fs.copyFileSync(source, dest);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error copying ${source} to ${dest}:`, error);
    return false;
  }
}

function copyDirectory(source: string, dest: string): boolean {
  try {
    if (!fs.existsSync(source)) {return false;}

    ensureDir(dest);
    const files = fs.readdirSync(source);

    files.forEach((file) => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(dest, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, destPath);
      } else {
        copyFile(sourcePath, destPath);
      }
    });

    return true;
  } catch (error) {
    console.error(`Error copying directory ${source} to ${dest}:`, error);
    return false;
  }
}

function updateNextJSApp(app: FrontendApp): void {
  const appPath = path.join(process.cwd(), app.path);

  if (!fs.existsSync(appPath)) {
    results.push({
      name: app.name,
      status: 'skipped',
      message: `Directory not found: ${appPath}`,
    });
    return;
  }

  console.log(`\n📦 Updating ${app.name}...`);

  // Copy components if needed
  if (app.hasComponents) {
    const componentsDest = path.join(appPath, 'components', 'ui');
    if (fs.existsSync('components/ui')) {
      copyDirectory('components/ui', componentsDest);
      console.log(`  ✅ Copied components to ${componentsDest}`);
    }
  }

  // Copy theme provider
  const themeProviderDest = path.join(appPath, 'components', 'theme-provider.tsx');
  if (fs.existsSync('components/theme-provider.tsx')) {
    copyFile('components/theme-provider.tsx', themeProviderDest);
    console.log(`  ✅ Copied theme-provider`);
  }

  // Copy utils
  const utilsDest = path.join(appPath, 'lib', 'utils.ts');
  if (fs.existsSync('lib/utils.ts')) {
    ensureDir(path.dirname(utilsDest));
    copyFile('lib/utils.ts', utilsDest);
    console.log(`  ✅ Copied utils`);
  }

  // Copy design tokens
  const tokensDest = path.join(appPath, 'lib', 'design-system', 'premium-tokens.ts');
  if (fs.existsSync('lib/design-system/premium-tokens.ts')) {
    ensureDir(path.dirname(tokensDest));
    copyFile('lib/design-system/premium-tokens.ts', tokensDest);
    console.log(`  ✅ Copied design tokens`);
  }

  // Update layout.tsx
  if (app.hasLayout) {
    const layoutPath = path.join(appPath, 'app', 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      let layoutContent = fs.readFileSync(layoutPath, 'utf8');

      // Check if ThemeProvider is already imported
      if (!layoutContent.includes('ThemeProvider')) {
        // Add import
        if (layoutContent.includes("from 'next/font/google'")) {
          layoutContent = layoutContent.replace(
            /import.*from ['"]next\/font\/google['"];?/,
            `$&\nimport { ThemeProvider } from '@/components/theme-provider';`
          );
        } else {
          // Add after other imports
          const importMatch = layoutContent.match(/import.*from ['"].*['"];?/);
          if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            const lastImportIndex = layoutContent.lastIndexOf(lastImport);
            const insertIndex = lastImportIndex + lastImport.length;
            layoutContent = layoutContent.slice(0, insertIndex) +
              `\nimport { ThemeProvider } from '@/components/theme-provider';` +
              layoutContent.slice(insertIndex);
          }
        }

        // Wrap body content with ThemeProvider
        if (layoutContent.includes('<body')) {
          layoutContent = layoutContent.replace(
            /<body[^>]*>/,
            (match) => match + '\n        <ThemeProvider\n          attribute="class"\n          defaultTheme="system"\n          enableSystem\n          disableTransitionOnChange\n        >'
          );

          if (layoutContent.includes('</body>')) {
            layoutContent = layoutContent.replace(
              '</body>',
              '        </ThemeProvider>\n      </body>'
            );
          }
        }

        fs.writeFileSync(layoutPath, layoutContent);
        console.log(`  ✅ Updated layout.tsx`);
      } else {
        console.log(`  ⏭️  Layout already has ThemeProvider`);
      }
    }
  }

  // Update globals.css
  if (app.hasGlobals) {
    const globalsPath = path.join(appPath, 'app', 'globals.css');
    if (fs.existsSync(globalsPath)) {
      // Check if premium colors are already there
      const globalsContent = fs.readFileSync(globalsPath, 'utf8');
      if (!globalsContent.includes('Premium Color System')) {
        // Backup original
        fs.copyFileSync(globalsPath, globalsPath + '.backup');

        // Read premium globals
        const premiumGlobals = fs.readFileSync('app/globals.css', 'utf8');
        const premiumBase = premiumGlobals.split('@layer utilities')[0];

        // Merge with existing (keep existing utilities)
        const existingUtilities = globalsContent.split('@layer utilities')[1] || '';
        const newContent = premiumBase + '\n@layer utilities {\n' + existingUtilities;

        fs.writeFileSync(globalsPath, newContent);
        console.log(`  ✅ Updated globals.css`);
      } else {
        console.log(`  ⏭️  Globals.css already updated`);
      }
    }
  }

  // Copy tailwind config if doesn't exist
  const tailwindConfigPath = path.join(appPath, 'tailwind.config.ts');
  if (!fs.existsSync(tailwindConfigPath) && fs.existsSync('tailwind.config.ts')) {
    copyFile('tailwind.config.ts', tailwindConfigPath);
    console.log(`  ✅ Copied tailwind.config.ts`);
  }

  results.push({
    name: app.name,
    status: 'success',
    message: 'Updated successfully',
  });
}

function updateViteApp(app: FrontendApp): void {
  const appPath = path.join(process.cwd(), app.path);

  if (!fs.existsSync(appPath)) {
    results.push({
      name: app.name,
      status: 'skipped',
      message: `Directory not found: ${appPath}`,
    });
    return;
  }

  console.log(`\n📦 Updating ${app.name} (Vite)...`);

  // Copy components
  const componentsDest = path.join(appPath, 'src', 'components', 'ui');
  if (fs.existsSync('components/ui')) {
    copyDirectory('components/ui', componentsDest);
    console.log(`  ✅ Copied components`);
  }

  // Copy theme provider
  const themeProviderDest = path.join(appPath, 'src', 'components', 'theme-provider.tsx');
  if (fs.existsSync('components/theme-provider.tsx')) {
    ensureDir(path.dirname(themeProviderDest));
    copyFile('components/theme-provider.tsx', themeProviderDest);
    console.log(`  ✅ Copied theme-provider`);
  }

  // Copy utils
  const utilsDest = path.join(appPath, 'src', 'lib', 'utils.ts');
  if (fs.existsSync('lib/utils.ts')) {
    ensureDir(path.dirname(utilsDest));
    copyFile('lib/utils.ts', utilsDest);
    console.log(`  ✅ Copied utils`);
  }

  // Update main CSS
  const cssPath = path.join(appPath, 'src', 'index.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('Premium Color System')) {
      // Backup
      fs.copyFileSync(cssPath, cssPath + '.backup');

      // Read premium globals base
      const premiumGlobals = fs.readFileSync('app/globals.css', 'utf8');
      const premiumBase = premiumGlobals.split('@layer utilities')[0];

      // Merge
      const existingUtilities = cssContent.split('@layer utilities')[1] || '';
      const newContent = premiumBase + '\n@layer utilities {\n' + existingUtilities;

      fs.writeFileSync(cssPath, newContent);
      console.log(`  ✅ Updated index.css`);
    }
  }

  // Update App.tsx to include ThemeProvider
  const appTsxPath = path.join(appPath, 'src', 'App.tsx');
  if (fs.existsSync(appTsxPath)) {
    let appContent = fs.readFileSync(appTsxPath, 'utf8');

    if (!appContent.includes('ThemeProvider')) {
      // Add import
      appContent = appContent.replace(
        /import.*from ['"]react['"]/,
        `$&\nimport { ThemeProvider } from './components/theme-provider';`
      );

      // Wrap app with ThemeProvider
      if (appContent.includes('<div className=')) {
        appContent = appContent.replace(
          /(<div[^>]*className[^>]*>)/,
          '<ThemeProvider\n        attribute="class"\n        defaultTheme="system"\n        enableSystem\n        disableTransitionOnChange\n      >\n        $1'
        );

        // Close ThemeProvider
        const lastClosingDiv = appContent.lastIndexOf('</div>');
        if (lastClosingDiv !== -1) {
          appContent = appContent.slice(0, lastClosingDiv) +
            '        </ThemeProvider>\n      ' +
            appContent.slice(lastClosingDiv);
        }
      }

      fs.writeFileSync(appTsxPath, appContent);
      console.log(`  ✅ Updated App.tsx`);
    }
  }

  results.push({
    name: app.name,
    status: 'success',
    message: 'Updated successfully',
  });
}

async function main() {
  console.log('🚀 Starting UI Overhaul for All Frontends...\n');
  console.log(`Found ${frontends.length} frontend applications\n`);

  for (const frontend of frontends) {
    try {
      if (frontend.type === 'nextjs') {
        updateNextJSApp(frontend);
      } else if (frontend.type === 'vite') {
        updateViteApp(frontend);
      }
    } catch (error) {
      results.push({
        name: frontend.name,
        status: 'error',
        message: `Error: ${error}`,
      });
      console.error(`❌ Error updating ${frontend.name}:`, error);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const success = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Success: ${success}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);

  console.log('\n📝 Details:');
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'skipped' ? '⏭️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  if (errors > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { frontends, updateNextJSApp, updateViteApp };

