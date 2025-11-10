/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN SYSTEM DEPLOYMENT SCRIPT
Deploys design system to all 113+ services
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Deploy design system to all services
 */
export async function deployDesignSystemToServices(): Promise<void> {
  console.log('🎨 Deploying Design System to all services...\n');

  const servicesDir = path.join(__dirname, '../../services');
  const appsDir = path.join(__dirname, '../../apps');

  // Get all service directories
  const services = fs.readdirSync(servicesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const apps = fs.readdirSync(appsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found ${services.length} services and ${apps.length} apps\n`);

  // Deploy to each service
  for (const service of services) {
    await deployToService(path.join(servicesDir, service), service);
  }

  // Deploy to each app
  for (const app of apps) {
    await deployToService(path.join(appsDir, app), app);
  }

  console.log('\n✅ Design System deployment complete!');
}

/**
 * Deploy design system to a single service/app
 */
async function deployToService(servicePath: string, serviceName: string): Promise<void> {
  try {
    // Check if package.json exists
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return; // Skip if no package.json
    }

    // Read package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Add design system dependency if not present
    if (!packageJson.dependencies?.['@azora/shared-design']) {
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['@azora/shared-design'] = 'workspace:*';
      
      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`  ✅ ${serviceName}: Added @azora/shared-design`);
    }

    // Create design tokens file if it doesn't exist
    const tokensPath = path.join(servicePath, 'design-tokens.ts');
    if (!fs.existsSync(tokensPath)) {
      const tokensContent = `/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Design Tokens - Auto-deployed from Design System
*/

export { 
  AZORA_GEM_COLORS,
  AZORA_GEM_TOKENS,
  SAPPHIRE_COLORS,
  EMERALD_COLORS,
  RUBY_COLORS,
  UBUNTU_COLORS,
  getGemColor,
  getUbuntuSpacing
} from '@azora/shared-design/tokens';

export default AZORA_GEM_TOKENS;
`;
      fs.writeFileSync(tokensPath, tokensContent);
      console.log(`  ✅ ${serviceName}: Created design-tokens.ts`);
    }

  } catch (error: any) {
    console.error(`  ⚠️  ${serviceName}: ${error.message}`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  deployDesignSystemToServices().catch(console.error);
}

export default deployDesignSystemToServices;
