#!/usr/bin/env node

/**
 * Installation Verification Script
 * Tests that all installation components are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Azora OS & Elara IDE Installation Verification');
console.log('================================================');
console.log('');

// Check that required directories exist
const requiredDirs = ['installers', 'elara-ide', 'ui'];

console.log('📁 Checking required directories...');
let allDirsExist = true;

for (const dir of requiredDirs) {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} (MISSING)`);
    allDirsExist = false;
  }
}

console.log('');

// Check that required installation files exist
const requiredFiles = [
  'installers/AZORA-OS-INSTALLER.ps1',
  'installers/azora-os-installer.sh',
  'installers/azora-os-installer.command',
  'installers/ELARA-IDE-INSTALLER.ps1',
  'installers/elara-ide-installer.sh',
  'installers/elara-ide-installer.command',
  'installers/INSTALL.bat',
  'INSTALLATION.md',
  'scripts/install-elara-ide.js',
];

console.log('📄 Checking required installation files...');
let allFilesExist = true;

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
    allFilesExist = false;
  }
}

console.log('');

// Check package.json for new scripts
console.log('⚙️  Checking package.json for new installation scripts...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredScripts = [
  'elara:ide:install',
  'elara:ide:install:win',
  'elara:ide:install:linux',
  'elara:ide:install:mac',
];

let allScriptsExist = true;

for (const script of requiredScripts) {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ ${script}`);
  } else {
    console.log(`  ❌ ${script} (MISSING)`);
    allScriptsExist = false;
  }
}

console.log('');

// Final report
console.log('📋 Final Verification Report:');
console.log('============================');

if (allDirsExist && allFilesExist && allScriptsExist) {
  console.log('  🎉 ALL INSTALLATION COMPONENTS VERIFIED SUCCESSFULLY');
  console.log('  🚀 Ready for cross-platform deployment');
  process.exit(0);
} else {
  console.log('  ⚠️  SOME INSTALLATION COMPONENTS ARE MISSING');
  if (!allDirsExist) console.log('     - Missing required directories');
  if (!allFilesExist) console.log('     - Missing required files');
  if (!allScriptsExist) console.log('     - Missing package.json scripts');
  console.log('  🛠️  Please check the installation setup');
  process.exit(1);
}
