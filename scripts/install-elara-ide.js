#!/usr/bin/env node

/**
 * Elara IDE Installation Script
 * Cross-platform installer for Elara IDE
 */

const os = require('os');
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Platform detection
const platform = os.platform();
const isWindows = platform === 'win32';
const isLinux = platform === 'linux';
const isMac = platform === 'darwin';

console.log('🚀 Elara IDE Cross-Platform Installer');
console.log('=====================================');
console.log(`Detected platform: ${platform}`);
console.log('');

// Function to execute command and handle errors
function executeCommand(command, options = {}) {
  try {
    console.log(`Executing: ${command}`);
    const result = execSync(command, {
      stdio: 'inherit',
      ...options,
    });
    return result;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Check prerequisites
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);

    // Check version (should be >= 20)
    const version = nodeVersion.replace('v', '').split('.')[0];
    if (parseInt(version) < 20) {
      console.warn('⚠️  Node.js version is below recommended (20+). Some features may not work.');
    }
  } catch (error) {
    console.error('❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/');
    process.exit(1);
  }

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    console.log(`✅ npm: ${npmVersion}`);
  } catch (error) {
    console.error('❌ npm is not installed. Please install Node.js which includes npm.');
    process.exit(1);
  }

  console.log('✅ All prerequisites met\n');
}

// Install Elara IDE based on platform
function installElaraIDE() {
  console.log('📥 Installing Elara IDE...');

  // Determine installer path
  const installerDir = path.join(__dirname, '..', 'installers');

  if (isWindows) {
    console.log('🖥️  Windows detected');
    const installerPath = path.join(installerDir, 'ELARA-IDE-INSTALLER.ps1');

    if (fs.existsSync(installerPath)) {
      console.log(' PowerShell installer found. Launching...');
      executeCommand(`powershell -ExecutionPolicy Bypass -File "${installerPath}"`);
    } else {
      console.error('❌ Windows installer not found');
      process.exit(1);
    }
  } else if (isLinux) {
    console.log('🐧 Linux detected');
    const installerPath = path.join(installerDir, 'elara-ide-installer.sh');

    if (fs.existsSync(installerPath)) {
      console.log(' Shell installer found. Making executable and launching...');
      executeCommand(`chmod +x "${installerPath}"`);
      executeCommand(`bash "${installerPath}"`);
    } else {
      console.error('❌ Linux installer not found');
      process.exit(1);
    }
  } else if (isMac) {
    console.log('🍎 macOS detected');
    const installerPath = path.join(installerDir, 'elara-ide-installer.command');

    if (fs.existsSync(installerPath)) {
      console.log(' Command installer found. Making executable and launching...');
      executeCommand(`chmod +x "${installerPath}"`);
      executeCommand(`bash "${installerPath}"`);
    } else {
      console.error('❌ macOS installer not found');
      process.exit(1);
    }
  } else {
    console.error(`❌ Unsupported platform: ${platform}`);
    process.exit(1);
  }
}

// Main execution
function main() {
  try {
    checkPrerequisites();
    installElaraIDE();
    console.log('\n🎉 Elara IDE installation completed!');
    console.log('You can now launch Elara IDE from your applications menu or by running the launcher script.');
  } catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { installElaraIDE, checkPrerequisites };
