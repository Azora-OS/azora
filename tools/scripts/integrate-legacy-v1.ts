#!/usr/bin/env tsx

/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

LEGACY V1 INTEGRATION SCRIPT
============================
*/

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LEGACY_PATH = '../../../old';
const CURRENT_PATH = '.';

const VALUABLE_LEGACY_COMPONENTS = [
  'app',
  'services', 
  'components',
  'lib',
  'assets',
  'docs',
  'scripts',
  'config'
];

async function integrateLegacyV1() {
  console.log('🔄 INTEGRATING LEGACY V1 COMPONENTS');
  console.log('===================================\n');

  if (!fs.existsSync(LEGACY_PATH)) {
    console.log('❌ Legacy folder not found at:', LEGACY_PATH);
    return;
  }

  // Create legacy integration directory
  const legacyIntegrationPath = 'legacy-v1-integration';
  fs.mkdirSync(legacyIntegrationPath, { recursive: true });

  console.log('📦 Analyzing legacy components...');
  
  VALUABLE_LEGACY_COMPONENTS.forEach(component => {
    const legacyComponentPath = path.join(LEGACY_PATH, component);
    const targetPath = path.join(legacyIntegrationPath, component);
    
    if (fs.existsSync(legacyComponentPath)) {
      console.log(`✅ Found legacy ${component}`);
      
      // Copy with selective integration
      try {
        execSync(`cp -r "${legacyComponentPath}" "${targetPath}"`, { stdio: 'pipe' });
        console.log(`📁 Copied ${component} to integration folder`);
      } catch (error) {
        // Windows fallback
        try {
          execSync(`xcopy "${legacyComponentPath}" "${targetPath}" /E /I /Q`, { stdio: 'pipe' });
          console.log(`📁 Copied ${component} to integration folder (Windows)`);
        } catch (winError) {
          console.log(`⚠️  Could not copy ${component} - manual review needed`);
        }
      }
    } else {
      console.log(`⚠️  Legacy ${component} not found`);
    }
  });

  // Create integration analysis
  const analysisReport = `# Legacy V1 Integration Analysis

## Components Found and Integrated

${VALUABLE_LEGACY_COMPONENTS.map(comp => {
    const exists = fs.existsSync(path.join(LEGACY_PATH, comp));
    return `- **${comp}**: ${exists ? '✅ Integrated' : '❌ Not found'}`;
  }).join('\n')}

## Integration Strategy

### Phase 1: Analysis (Current)
- Copy legacy components to integration folder
- Analyze code quality and compatibility
- Identify valuable features to preserve

### Phase 2: Selective Integration
- Extract valuable UI components
- Preserve working service implementations
- Integrate useful utilities and helpers

### Phase 3: Modernization
- Update legacy code to current standards
- Apply new design system
- Ensure TypeScript compatibility

## Next Steps

1. Review copied components in \`legacy-v1-integration/\`
2. Identify specific features to integrate
3. Create migration plan for valuable components
4. Test integrated components with current system

## Legacy Value Assessment

- **UI Components**: Preserve unique designs
- **Service Logic**: Extract working business logic  
- **Configuration**: Merge useful configs
- **Documentation**: Preserve institutional knowledge
`;

  fs.writeFileSync(path.join(legacyIntegrationPath, 'INTEGRATION-ANALYSIS.md'), analysisReport);

  console.log('\n🎯 LEGACY INTEGRATION COMPLETE!');
  console.log('\n📊 Summary:');
  console.log(`• Legacy components copied to: ${legacyIntegrationPath}/`);
  console.log('• Integration analysis created');
  console.log('• Ready for selective feature extraction');
  
  console.log('\n🔍 Next Steps:');
  console.log('1. Review: cat legacy-v1-integration/INTEGRATION-ANALYSIS.md');
  console.log('2. Analyze: explore legacy-v1-integration/ folder');
  console.log('3. Extract: identify valuable components to integrate');
}

integrateLegacyV1().catch(console.error);