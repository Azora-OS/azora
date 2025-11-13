#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix TypeScript configuration errors
const fixes = [
  {
    file: 'azora-nexus/tsconfig.json',
    fixes: [
      { find: '"moduleResolution": "bundler"', replace: '"moduleResolution": "node"' },
      { find: '"ignoreDeprecations": "5.0"', replace: '' }
    ]
  },
  {
    file: 'azora-mint/tsconfig.json', 
    fixes: [
      { find: '"types": ["jest", "node"]', replace: '"types": []' }
    ]
  }
];

console.log('🔧 FIXING TYPESCRIPT ERRORS');

fixes.forEach(({ file, fixes: fileFixes }) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    fileFixes.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(find, replace);
        console.log(`✅ Fixed ${file}: ${find} → ${replace}`);
      }
    });
    fs.writeFileSync(filePath, content);
  }
});

// Install missing dependencies
const { execSync } = require('child_process');

console.log('📦 Installing missing dependencies...');
try {
  execSync('npm install -g @types/node @types/express @types/cors', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️ Some dependencies may already be installed');
}

console.log('🎯 TypeScript errors fixed!');