/**
 * Quick executable finder - searches for any .exe files in the repository
 * excluding node_modules and .git directories
 */

import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

function findExecutables(dir: string, depth: number = 0, maxDepth: number = 5): string[] {
  const executables: string[] = [];
  
  if (depth > maxDepth) return executables;
  if (dir.includes('node_modules') || dir.includes('.git')) return executables;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      
      try {
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          executables.push(...findExecutables(fullPath, depth + 1, maxDepth));
        } else if (item.endsWith('.exe') || item.endsWith('.app') || item.endsWith('.msi') || item.endsWith('.deb') || item.endsWith('.rpm') || item.endsWith('.dmg')) {
          executables.push(fullPath);
        }
      } catch (err) {
        // Skip files we can't access
      }
    }
  } catch (err) {
    // Skip directories we can't access
  }
  
  return executables;
}

console.log('🔍 Searching for executables in repository...\n');

const rootDir = process.cwd();
const executables = findExecutables(rootDir);

if (executables.length > 0) {
  console.log(`✅ Found ${executables.length} executable(s):\n`);
  executables.forEach((exe, index) => {
    try {
      const stat = statSync(exe);
      const size = stat.size;
      const sizeKB = (size / 1024).toFixed(2);
      console.log(`${index + 1}. ${exe}`);
      console.log(`   Size: ${sizeKB} KB\n`);
    } catch {
      console.log(`${index + 1}. ${exe}`);
      console.log(`   ⚠️  File inaccessible or deleted\n`);
    }
  });
} else {
  console.log('⚠️  No executables found in repository.');
  console.log('\nTo build executables, run:');
  console.log('  npm run build:exe:ts');
  console.log('  or');
  console.log('  .\\build-exe-for-testing.bat');
}

export { executables };

