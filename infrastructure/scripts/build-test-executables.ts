#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * Build test executables for all platforms
 * Creates .exe files for Windows testing
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🔨 Building test executables...\n');

const distDir = join(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Check if electron is installed
let electronInstalled = false;
try {
  execSync('npm list electron', { stdio: 'pipe' });
  electronInstalled = true;
} catch {
  console.log('📦 Installing Electron dependencies...');
  try {
    execSync('npm install --save-dev electron electron-builder', { stdio: 'inherit' });
    electronInstalled = true;
  } catch (error) {
    console.log('⚠️  Electron installation failed, trying alternative...');
  }
}

// Create electron main file if it doesn't exist
const electronMainPath = join(process.cwd(), 'electron-main.js');
if (!existsSync(electronMainPath)) {
  const electronMain = `/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load Next.js app
  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile('out/index.html');
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
`;
  writeFileSync(electronMainPath, electronMain);
  console.log('✅ Created electron-main.js');
}

// Update package.json with electron builder config
const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

if (!packageJson.build) {
  packageJson.main = 'electron-main.js';
  packageJson.build = {
    appId: 'com.azora.os',
    productName: 'Azora OS',
    directories: {
      output: 'dist'
    },
    files: [
      'ui/**/*',
      'services/**/*',
      'electron-main.js',
      'package.json'
    ],
    win: {
      target: ['nsis', 'portable'],
      icon: 'public/icon.ico'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true
    }
  };
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with Electron builder config');
}

// Build Windows executable
if (electronInstalled) {
  console.log('\n🔨 Building Windows executable...');
  try {
    execSync('npx electron-builder --win --x64 --dir', { stdio: 'inherit' });
    console.log('\n✅ Windows executable built successfully!');
    console.log('📁 Location: dist/win-unpacked/');
  } catch (error) {
    console.log('\n⚠️  Electron build failed, trying alternative method...');
    
    // Alternative: Create a simple Node.js executable wrapper
    console.log('📦 Installing pkg for alternative build...');
    try {
      execSync('npm install --save-dev pkg', { stdio: 'inherit' });
      
      const simpleServer = `/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

const { spawn } = require('child_process');
const express = require('express');
const { execSync } = require('child_process');

const app = express();
const PORT = 3000;

app.use(express.static('out'));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/out/index.html');
});

app.listen(PORT, () => {
  console.log('Azora OS running on http://localhost:' + PORT);
  if (process.platform === 'win32') {
    execSync('start http://localhost:' + PORT);
  }
});
`;
      writeFileSync(join(distDir, 'azora-os-server.js'), simpleServer);
      
      // Update package.json for pkg
      packageJson.pkg = {
        targets: ['node18-win-x64'],
        outputPath: 'dist',
        assets: ['out/**/*']
      };
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      console.log('✅ Created alternative server file');
      console.log('📝 To build: npx pkg dist/azora-os-server.js --targets node18-win-x64');
    } catch (pkgError) {
      console.log('❌ Alternative build methods failed');
    }
  }
}

// List any executables found
console.log('\n📋 Checking for executables...');
const findExecutables = (dir: string): string[] => {
  const files: string[] = [];
  try {
    const fs = require('fs');
    const path = require('path');
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...findExecutables(fullPath));
      } else if (item.name.endsWith('.exe') || item.name.endsWith('.app')) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
};

const executables = findExecutables(distDir);
if (executables.length > 0) {
  console.log('\n✅ Found executables:');
  executables.forEach(exe => console.log(`   - ${exe}`));
} else {
  console.log('\n⚠️  No executables found in dist folder');
  console.log('   Try running: npm run build:all first');
}

console.log('\n✅ Build process complete!');

