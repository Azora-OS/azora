#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import fs from 'fs';
import path from 'path';

const APP_THEMES = {
  'apps/app': 'education',
  'apps/learn-ui': 'education', 
  'apps/student-portal': 'education',
  'apps/pay-ui': 'finance',
  'apps/azora-mint': 'finance',
  'apps/marketplace-ui': 'marketplace',
  'apps/enterprise-ui': 'enterprise',
  'apps/cloud-ui': 'cloud',
  'apps/compliance-ui': 'compliance',
  'apps/dev-ui': 'dev'
};

async function applyAppThemes() {
  console.log('🎨 APPLYING APP-SPECIFIC THEMES');
  console.log('===============================\n');

  const themeCSS = fs.readFileSync('packages/ui/app-themes.css', 'utf8');

  Object.entries(APP_THEMES).forEach(([appPath, theme]) => {
    if (fs.existsSync(appPath)) {
      // Add theme CSS
      const globalsCSSPath = path.join(appPath, 'globals.css');
      if (fs.existsSync(globalsCSSPath)) {
        const existingCSS = fs.readFileSync(globalsCSSPath, 'utf8');
        fs.writeFileSync(globalsCSSPath, existingCSS + '\n\n' + themeCSS);
      }

      // Update layout to include theme classes
      const layoutPath = path.join(appPath, 'layout.tsx');
      if (fs.existsSync(layoutPath)) {
        let layout = fs.readFileSync(layoutPath, 'utf8');
        layout = layout.replace(
          '<body',
          `<body className="app-themed theme-${theme} premium-trim"`
        );
        fs.writeFileSync(layoutPath, layout);
      }

      console.log(`✅ Applied ${theme} theme to ${appPath}`);
    }
  });

  console.log('\n🌈 THEME APPLICATION COMPLETE!');
  console.log('\n🎯 App Themes:');
  console.log('• Education: Blue with gold trim');
  console.log('• Finance: Green with gold trim');
  console.log('• Marketplace: Purple with gold trim');
  console.log('• Enterprise: Orange with gold trim');
  console.log('• Cloud: Cyan with gold trim');
  console.log('• Compliance: Red with gold trim');
  console.log('• Dev: Indigo with gold trim');
}

applyAppThemes().catch(console.error);