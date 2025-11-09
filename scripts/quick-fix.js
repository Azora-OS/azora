#!/usr/bin/env node

/*
AZORA OS QUICK ERROR FIXER
Constitutional AI Operating System - Immediate Error Resolution
*/

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function quickFix() {
  console.log('🚀 AZORA OS QUICK ERROR FIXER');
  console.log('═══════════════════════════════════════\n');

  // 1. Install most critical packages
  console.log('📦 Installing critical packages...');
  try {
    await execAsync('npm install prom-client morgan socket.io openai express cors', { cwd: rootDir });
    console.log('✅ Root packages installed');
  } catch (error) {
    console.log('⚠️  Root package installation failed');
  }

  // 2. Fix API Gateway
  const apiGatewayPath = path.join(rootDir, 'services', 'api-gateway');
  if (await pathExists(apiGatewayPath)) {
    try {
      await execAsync('npm install prom-client express cors', { cwd: apiGatewayPath });
      console.log('✅ API Gateway dependencies fixed');
    } catch (error) {
      console.log('⚠️  API Gateway fix failed');
    }
  }

  // 3. Fix Azora Covenant
  const covenantPath = path.join(rootDir, 'services', 'azora-covenant');
  if (await pathExists(covenantPath)) {
    try {
      await execAsync('npm install morgan express', { cwd: covenantPath });
      console.log('✅ Azora Covenant dependencies fixed');
    } catch (error) {
      console.log('⚠️  Azora Covenant fix failed');
    }
  }

  // 4. Fix Azora Workspace
  const workspacePath = path.join(rootDir, 'services', 'azora-workspace');
  if (await pathExists(workspacePath)) {
    try {
      await execAsync('npm install socket.io express', { cwd: workspacePath });
      console.log('✅ Azora Workspace dependencies fixed');
    } catch (error) {
      console.log('⚠️  Azora Workspace fix failed');
    }
  }

  // 5. Fix Azora LMS
  const lmsPath = path.join(rootDir, 'services', 'azora-lms');
  if (await pathExists(lmsPath)) {
    try {
      await execAsync('npm install openai typescript', { cwd: lmsPath });
      console.log('✅ Azora LMS dependencies fixed');
    } catch (error) {
      console.log('⚠️  Azora LMS fix failed');
    }
  }

  // 6. Install global tools
  console.log('🌐 Installing global tools...');
  try {
    await execAsync('npm install -g tsx ts-node ts-node-dev');
    console.log('✅ Global tools installed');
  } catch (error) {
    console.log('⚠️  Global tools installation failed (try running as administrator)');
  }

  console.log('\n✅ Quick fixes applied!');
  console.log('🚀 Try running the orchestrator again: node scripts/master-orchestrator.js');
}

quickFix().catch(console.error);