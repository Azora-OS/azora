/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Apply Branding to All Services Script
 *
 * Systematically applies logos, colors, and branding to all frontend services
 */

import * as fs from 'fs';
import * as path from 'path';
import { SERVICE_BRANDS } from '../lib/branding/service-config';

interface ServiceUpdate {
  path: string;
  brand: typeof SERVICE_BRANDS[keyof typeof SERVICE_BRANDS];
  type: 'nextjs' | 'vite';
}

const services: ServiceUpdate[] = [
  { path: 'app', brand: SERVICE_BRANDS['app'], type: 'nextjs' },
  { path: 'synapse/academy-ui', brand: SERVICE_BRANDS['synapse/academy-ui'], type: 'nextjs' },
  { path: 'synapse/atlas-ui', brand: SERVICE_BRANDS['synapse/atlas-ui'], type: 'nextjs' },
  { path: 'synapse/council-ui', brand: SERVICE_BRANDS['synapse/council-ui'], type: 'nextjs' },
  { path: 'synapse/pulse-ui', brand: SERVICE_BRANDS['synapse/pulse-ui'], type: 'nextjs' },
  { path: 'synapse/signal-ui', brand: SERVICE_BRANDS['synapse/signal-ui'], type: 'nextjs' },
  { path: 'synapse/vault-ui', brand: SERVICE_BRANDS['synapse/vault-ui'], type: 'nextjs' },
  { path: 'synapse/vigil-ui', brand: SERVICE_BRANDS['synapse/vigil-ui'], type: 'nextjs' },
  { path: 'synapse/main-app', brand: SERVICE_BRANDS['synapse/main-app'], type: 'nextjs' },
  { path: 'elara-ide', brand: SERVICE_BRANDS['elara-ide'], type: 'nextjs' },
  { path: 'azora-ui', brand: SERVICE_BRANDS['azora-ui'], type: 'nextjs' },
  { path: 'ui', brand: SERVICE_BRANDS['ui'], type: 'nextjs' },
  { path: 'marketplace-ui', brand: SERVICE_BRANDS['marketplace-ui'], type: 'vite' },
  { path: 'pay-ui', brand: SERVICE_BRANDS['pay-ui'], type: 'vite' },
  { path: 'cloud-ui', brand: SERVICE_BRANDS['cloud-ui'], type: 'vite' },
  { path: 'dev-ui', brand: SERVICE_BRANDS['dev-ui'], type: 'vite' },
  { path: 'enterprise-ui', brand: SERVICE_BRANDS['enterprise-ui'], type: 'vite' },
  { path: 'learn-ui', brand: SERVICE_BRANDS['learn-ui'], type: 'vite' },
  { path: 'compliance-ui', brand: SERVICE_BRANDS['compliance-ui'], type: 'vite' },
];

function updateNextJSLayout(servicePath: string, brand: typeof SERVICE_BRANDS[keyof typeof SERVICE_BRANDS]): void {
  const layoutPath = path.join(process.cwd(), servicePath, 'app', 'layout.tsx');

  if (!fs.existsSync(layoutPath)) {
    console.log(`  ⏭️  Layout not found: ${layoutPath}`);
    return;
  }

  let content = fs.readFileSync(layoutPath, 'utf8');

  // Update metadata
  const metadataPattern = /export const metadata: Metadata = \{([^}]+)\}/s;
  const metadataMatch = content.match(metadataPattern);

  if (metadataMatch) {
    const newMetadata = `export const metadata: Metadata = {
  title: "${brand.name} - ${brand.tagline}",
  description: "${brand.description}",
  icons: {
    icon: "${brand.favicon}",
    apple: "${brand.favicon}",
  },
}`;

    content = content.replace(metadataPattern, newMetadata);
    console.log(`  ✅ Updated metadata`);
  }

  // Add theme color based on brand
  if (!content.includes('theme-color')) {
    const headPattern = /(<head[^>]*>)/;
    if (headPattern.test(content)) {
      content = content.replace(
        headPattern,
        `$1\n        <meta name="theme-color" content="${brand.colors.primary}" />`
      );
      console.log(`  ✅ Added theme color`);
    }
  }

  fs.writeFileSync(layoutPath, content);
}

function updateViteApp(servicePath: string, brand: typeof SERVICE_BRANDS[keyof typeof SERVICE_BRANDS]): void {
  const indexHtmlPath = path.join(process.cwd(), servicePath, 'index.html');

  if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');

    // Update title
    content = content.replace(
      /<title>.*?<\/title>/,
      `<title>${brand.name} - ${brand.tagline}</title>`
    );

    // Update favicon
    content = content.replace(
      /<link[^>]*rel=["']icon["'][^>]*>/,
      `<link rel="icon" href="${brand.favicon}" />`
    );

    // Add theme color
    if (!content.includes('theme-color')) {
      content = content.replace(
        /<meta[^>]*charset[^>]*>/,
        `$&\n  <meta name="theme-color" content="${brand.colors.primary}" />`
      );
    }

    fs.writeFileSync(indexHtmlPath, content);
    console.log(`  ✅ Updated index.html`);
  }
}

async function main() {
  console.log('🎨 Applying Branding to All Services...\n');

  for (const service of services) {
    const fullPath = path.join(process.cwd(), service.path);

    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipped ${service.path} (not found)`);
      continue;
    }

    console.log(`\n📦 Branding ${service.path}...`);
    console.log(`   Service: ${service.brand.name}`);
    console.log(`   Logo: ${service.brand.logo}`);
    console.log(`   Colors: ${service.brand.colors.primary}`);

    try {
      if (service.type === 'nextjs') {
        updateNextJSLayout(service.path, service.brand);
      } else {
        updateViteApp(service.path, service.brand);
      }
      console.log(`   ✅ Completed`);
    } catch (error) {
      console.error(`   ❌ Error:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Branding application complete!');
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('   1. Update pages to use ServiceHeader component');
  console.log('   2. Apply brand-specific colors to CSS');
  console.log('   3. Test each service');
}

if (require.main === module) {
  main().catch(console.error);
}

export { updateNextJSLayout, updateViteApp };

