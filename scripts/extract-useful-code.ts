/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Extract Useful Code from Cloned Repositories
 *
 * This script analyzes cloned repositories and extracts:
 * - React/TypeScript components
 * - API routes and schemas
 * - Utilities and helpers
 * - Configuration files
 * - Documentation
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractionConfig {
  featureType: string;
  sourceDir: string;
  targetDir: string;
  patterns: {
    include: string[];
    exclude: string[];
  };
  extractTypes: ('components' | 'api' | 'utils' | 'types' | 'hooks' | 'config')[];
}

const CLONE_DIR = path.join(process.cwd(), 'cloned-repos');
const EXTRACT_DIR = path.join(process.cwd(), 'extracted-features');

const extractionConfigs: ExtractionConfig[] = [
  {
    featureType: 'forums',
    sourceDir: 'cloned-repos/forums',
    targetDir: 'extracted-features/forums',
    patterns: {
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.graphql', '**/*.gql'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*']
    },
    extractTypes: ['components', 'api', 'utils', 'types', 'hooks']
  },
  {
    featureType: 'chat',
    sourceDir: 'cloned-repos/chat',
    targetDir: 'extracted-features/chat',
    patterns: {
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    extractTypes: ['components', 'api', 'utils', 'hooks']
  },
  {
    featureType: 'certifications',
    sourceDir: 'cloned-repos/certifications',
    targetDir: 'extracted-features/certifications',
    patterns: {
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.json'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    extractTypes: ['components', 'api', 'utils', 'types']
  },
  {
    featureType: 'course-builder',
    sourceDir: 'cloned-repos/course-builder',
    targetDir: 'extracted-features/course-builder',
    patterns: {
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js', '**/*.php'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/vendor/**']
    },
    extractTypes: ['components', 'api', 'utils', 'types', 'hooks', 'config']
  },
  {
    featureType: 'assessments',
    sourceDir: 'cloned-repos/assessments',
    targetDir: 'extracted-features/assessments',
    patterns: {
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    extractTypes: ['components', 'api', 'utils', 'types']
  },
  {
    featureType: 'auth',
    sourceDir: 'cloned-repos/auth',
    targetDir: 'extracted-features/auth',
    patterns: {
      include: ['**/*.ts', '**/*.js', '**/*.go', '**/*.java'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    extractTypes: ['api', 'utils', 'types', 'config']
  },
  {
    featureType: 'graphql',
    sourceDir: 'cloned-repos/graphql',
    targetDir: 'extracted-features/graphql',
    patterns: {
      include: ['**/*.ts', '**/*.js', '**/*.graphql', '**/*.gql'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/build/**']
    },
    extractTypes: ['api', 'utils', 'types', 'config']
  }
];

function getAllFiles(dir: string, patterns: string[], exclude: string[]): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  function walkDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(dir, fullPath);

      // Check exclude patterns
      if (exclude.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(relativePath);
      })) {
        continue;
      }

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        // Check include patterns
        if (patterns.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
          return regex.test(relativePath);
        })) {
          files.push(fullPath);
        }
      }
    }
  }

  walkDir(dir);
  return files;
}

function categorizeFile(filePath: string): string | null {
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  // Component files
  if (fileName.match(/\.(tsx|jsx)$/) && (
    fileName.includes('Component') ||
    fileName.includes('Page') ||
    fileName.includes('Screen') ||
    dirName.includes('components') ||
    dirName.includes('pages') ||
    dirName.includes('views')
  )) {
    return 'components';
  }

  // API files
  if (fileName.match(/\.(ts|js)$/) && (
    fileName.includes('api') ||
    fileName.includes('route') ||
    fileName.includes('handler') ||
    fileName.includes('controller') ||
    dirName.includes('api') ||
    dirName.includes('routes') ||
    dirName.includes('controllers')
  )) {
    return 'api';
  }

  // GraphQL files
  if (fileName.match(/\.(graphql|gql)$/)) {
    return 'api';
  }

  // Utility files
  if (fileName.match(/\.(ts|js)$/) && (
    fileName.includes('util') ||
    fileName.includes('helper') ||
    fileName.includes('utils') ||
    dirName.includes('utils') ||
    dirName.includes('helpers')
  )) {
    return 'utils';
  }

  // Type files
  if (fileName.match(/\.(ts|d\.ts)$/) && (
    fileName.includes('type') ||
    fileName.includes('interface') ||
    fileName.includes('types') ||
    dirName.includes('types')
  )) {
    return 'types';
  }

  // Hook files
  if (fileName.match(/\.(ts|tsx|js|jsx)$/) && (
    fileName.includes('use') ||
    fileName.includes('hook') ||
    dirName.includes('hooks')
  )) {
    return 'hooks';
  }

  // Config files
  if (fileName.match(/\.(json|yaml|yml|config|conf)$/) ||
      fileName.includes('config')) {
    return 'config';
  }

  return null;
}

async function extractCode(config: ExtractionConfig) {
  console.log(`\n📦 Extracting ${config.featureType}...`);

  const sourcePath = path.join(process.cwd(), config.sourceDir);
  const targetPath = path.join(process.cwd(), config.targetDir);

  if (!fs.existsSync(sourcePath)) {
    console.log(`  ⚠️  Source directory not found: ${sourcePath}`);
    return;
  }

  // Create target directories
  const categories = ['components', 'api', 'utils', 'types', 'hooks', 'config'];
  categories.forEach(cat => {
    fs.mkdirSync(path.join(targetPath, cat), { recursive: true });
  });

  // Get all files
  const files = getAllFiles(sourcePath, config.patterns.include, config.patterns.exclude);

  console.log(`  Found ${files.length} files to process`);

  let extractedCount = 0;

  for (const file of files) {
    const category = categorizeFile(file);

    if (!category || !config.extractTypes.includes(category as any)) {
      continue;
    }

    const relativePath = path.relative(sourcePath, file);
    const targetFile = path.join(targetPath, category, path.basename(file));

    try {
      // Copy file
      fs.copyFileSync(file, targetFile);
      extractedCount++;
    } catch (error) {
      console.error(`  ❌ Error copying ${file}:`, error);
    }
  }

  console.log(`  ✅ Extracted ${extractedCount} files`);

  // Create summary
  const summary = {
    featureType: config.featureType,
    extractedCount,
    categories: categories.reduce((acc, cat) => {
      const catPath = path.join(targetPath, cat);
      if (fs.existsSync(catPath)) {
        const files = fs.readdirSync(catPath);
        acc[cat] = files.length;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  fs.writeFileSync(
    path.join(targetPath, 'extraction-summary.json'),
    JSON.stringify(summary, null, 2)
  );
}

async function main() {
  console.log('🚀 Starting code extraction...\n');

  // Create extract directory
  fs.mkdirSync(EXTRACT_DIR, { recursive: true });

  for (const config of extractionConfigs) {
    await extractCode(config);
  }

  console.log('\n✅ Code extraction complete!');
  console.log(`📁 Extracted code is in: ${EXTRACT_DIR}`);
}

main().catch(console.error);

