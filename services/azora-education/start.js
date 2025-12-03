#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function startService() {
  try {
    console.log('🚀 Starting Azora Education Service...');
    
    // Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated');
    
    // Start the service
    console.log('🔧 Starting service...');
    require('./index.js');
    
  } catch (error) {
    console.error('❌ Error starting service:', error.message);
    process.exit(1);
  }
}

startService();