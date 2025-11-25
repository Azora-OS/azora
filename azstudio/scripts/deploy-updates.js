#!/usr/bin/env node

/**
 * Deploy Updates Script
 * 
 * Uploads release files to the update server and configures staged rollout.
 * Supports multiple deployment targets: local, S3, Azure, custom server.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const RELEASE_DIR = path.join(__dirname, '..', 'release');
const CONFIG_FILE = path.join(__dirname, '..', 'deploy-config.json');

// Load deployment configuration
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (error) {
      console.error('Failed to load deploy config:', error.message);
    }
  }
  
  // Default configuration
  return {
    target: 'local',
    local: {
      serverUrl: 'http://localhost:3001',
      adminToken: 'dev-token'
    },
    s3: {
      bucket: 'azstudio-updates',
      region: 'us-east-1',
      cloudfront: null
    },
    azure: {
      storageAccount: 'azstudioupdates',
      container: 'releases'
    },
    custom: {
      serverUrl: 'https://updates.azora.com',
      adminToken: process.env.ADMIN_TOKEN
    }
  };
}

// Calculate file hash
function calculateHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha512');
  hashSum.update(fileBuffer);
  return hashSum.digest('base64');
}

// Get file size
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Deploy to local server
async function deployLocal(channel, version, config) {
  console.log(`📦 Deploying ${version} to local server (${channel} channel)...`);
  
  const channelDir = path.join(RELEASE_DIR, channel);
  const versionDir = path.join(channelDir, version);
  
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version directory not found: ${versionDir}`);
  }
  
  // Files are already in place for local server
  console.log('✅ Files already in place for local server');
  
  // Configure staged rollout
  const rolloutPercentage = channel === 'alpha' ? 100 : 
                           channel === 'beta' ? 25 : 10;
  
  console.log(`🎯 Configuring staged rollout: ${rolloutPercentage}%`);
  
  const rolloutConfig = {
    version,
    percentage: rolloutPercentage,
    startDate: new Date().toISOString()
  };
  
  try {
    const response = await fetch(`${config.local.serverUrl}/admin/rollout/${channel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.local.adminToken}`
      },
      body: JSON.stringify(rolloutConfig)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to configure rollout: ${response.statusText}`);
    }
    
    console.log('✅ Staged rollout configured');
  } catch (error) {
    console.warn('⚠️  Failed to configure rollout:', error.message);
    console.warn('   You may need to configure it manually');
  }
  
  return true;
}

// Deploy to AWS S3
async function deployS3(channel, version, config) {
  console.log(`📦 Deploying ${version} to AWS S3 (${channel} channel)...`);
  
  const channelDir = path.join(RELEASE_DIR, channel);
  const versionDir = path.join(channelDir, version);
  
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version directory not found: ${versionDir}`);
  }
  
  // Check if AWS CLI is available
  try {
    execSync('aws --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('AWS CLI not found. Please install it first.');
  }
  
  // Upload version directory
  console.log('📤 Uploading files to S3...');
  const s3Path = `s3://${config.s3.bucket}/${channel}/${version}/`;
  
  try {
    execSync(
      `aws s3 sync "${versionDir}" "${s3Path}" --acl public-read`,
      { stdio: 'inherit' }
    );
  } catch (error) {
    throw new Error('Failed to upload to S3');
  }
  
  // Upload latest.yml
  const latestYml = path.join(channelDir, 'latest.yml');
  if (fs.existsSync(latestYml)) {
    console.log('📤 Uploading latest.yml...');
    execSync(
      `aws s3 cp "${latestYml}" "s3://${config.s3.bucket}/${channel}/latest.yml" --acl public-read`,
      { stdio: 'inherit' }
    );
  }
  
  // Invalidate CloudFront cache if configured
  if (config.s3.cloudfront) {
    console.log('🔄 Invalidating CloudFront cache...');
    try {
      execSync(
        `aws cloudfront create-invalidation --distribution-id ${config.s3.cloudfront} --paths "/${channel}/*"`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      console.warn('⚠️  Failed to invalidate CloudFront cache:', error.message);
    }
  }
  
  console.log('✅ Deployed to S3');
  return true;
}

// Deploy to Azure Blob Storage
async function deployAzure(channel, version, config) {
  console.log(`📦 Deploying ${version} to Azure Blob Storage (${channel} channel)...`);
  
  const channelDir = path.join(RELEASE_DIR, channel);
  const versionDir = path.join(channelDir, version);
  
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version directory not found: ${versionDir}`);
  }
  
  // Check if Azure CLI is available
  try {
    execSync('az --version', { stdio: 'ignore' });
  } catch (error) {
    throw new Error('Azure CLI not found. Please install it first.');
  }
  
  // Upload version directory
  console.log('📤 Uploading files to Azure...');
  
  try {
    execSync(
      `az storage blob upload-batch -d ${config.azure.container}/${channel}/${version} -s "${versionDir}" --account-name ${config.azure.storageAccount}`,
      { stdio: 'inherit' }
    );
  } catch (error) {
    throw new Error('Failed to upload to Azure');
  }
  
  // Upload latest.yml
  const latestYml = path.join(channelDir, 'latest.yml');
  if (fs.existsSync(latestYml)) {
    console.log('📤 Uploading latest.yml...');
    execSync(
      `az storage blob upload -f "${latestYml}" -c ${config.azure.container} -n ${channel}/latest.yml --account-name ${config.azure.storageAccount}`,
      { stdio: 'inherit' }
    );
  }
  
  console.log('✅ Deployed to Azure');
  return true;
}

// Deploy to custom server
async function deployCustom(channel, version, config) {
  console.log(`📦 Deploying ${version} to custom server (${channel} channel)...`);
  
  const channelDir = path.join(RELEASE_DIR, channel);
  const versionDir = path.join(channelDir, version);
  
  if (!fs.existsSync(versionDir)) {
    throw new Error(`Version directory not found: ${versionDir}`);
  }
  
  // This is a placeholder - implement based on your server's API
  console.log('⚠️  Custom server deployment not fully implemented');
  console.log('   Please upload files manually or implement custom logic');
  console.log(`   Source: ${versionDir}`);
  console.log(`   Target: ${config.custom.serverUrl}/${channel}/${version}/`);
  
  return false;
}

// Increase rollout percentage
async function increaseRollout(channel, percentage, config) {
  console.log(`🎯 Increasing rollout for ${channel} to ${percentage}%...`);
  
  const serverUrl = config.target === 'local' ? config.local.serverUrl : config.custom.serverUrl;
  const adminToken = config.target === 'local' ? config.local.adminToken : config.custom.adminToken;
  
  try {
    const response = await fetch(`${serverUrl}/admin/rollout/${channel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ percentage })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update rollout: ${response.statusText}`);
    }
    
    console.log('✅ Rollout percentage updated');
    return true;
  } catch (error) {
    console.error('❌ Failed to update rollout:', error.message);
    return false;
  }
}

// Trigger rollback
async function triggerRollback(channel, toVersion, config) {
  console.log(`⏮️  Rolling back ${channel} to version ${toVersion}...`);
  
  const serverUrl = config.target === 'local' ? config.local.serverUrl : config.custom.serverUrl;
  const adminToken = config.target === 'local' ? config.local.adminToken : config.custom.adminToken;
  
  try {
    const response = await fetch(`${serverUrl}/admin/rollback/${channel}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ toVersion })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to rollback: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅', result.message);
    return true;
  } catch (error) {
    console.error('❌ Failed to rollback:', error.message);
    return false;
  }
}

// Get analytics
async function getAnalytics(days, config) {
  console.log(`📊 Fetching analytics for last ${days} days...`);
  
  const serverUrl = config.target === 'local' ? config.local.serverUrl : config.custom.serverUrl;
  const adminToken = config.target === 'local' ? config.local.adminToken : config.custom.adminToken;
  
  try {
    const response = await fetch(`${serverUrl}/admin/analytics?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
AzStudio Update Deployment Tool

Usage:
  node deploy-updates.js deploy <channel> <version>    Deploy a version to a channel
  node deploy-updates.js rollout <channel> <percentage> Increase rollout percentage
  node deploy-updates.js rollback <channel> <version>   Rollback to a previous version
  node deploy-updates.js analytics [days]               Get analytics data

Examples:
  node deploy-updates.js deploy alpha 0.2.0
  node deploy-updates.js rollout stable 50
  node deploy-updates.js rollback stable 0.1.9
  node deploy-updates.js analytics 7

Channels: alpha, beta, stable
    `);
    process.exit(0);
  }
  
  const config = loadConfig();
  
  try {
    switch (command) {
      case 'deploy': {
        const channel = args[1];
        const version = args[2];
        
        if (!channel || !version) {
          console.error('❌ Usage: deploy <channel> <version>');
          process.exit(1);
        }
        
        if (!['alpha', 'beta', 'stable'].includes(channel)) {
          console.error('❌ Invalid channel. Use: alpha, beta, or stable');
          process.exit(1);
        }
        
        let success = false;
        switch (config.target) {
          case 'local':
            success = await deployLocal(channel, version, config);
            break;
          case 's3':
            success = await deployS3(channel, version, config);
            break;
          case 'azure':
            success = await deployAzure(channel, version, config);
            break;
          case 'custom':
            success = await deployCustom(channel, version, config);
            break;
          default:
            console.error('❌ Invalid deployment target:', config.target);
            process.exit(1);
        }
        
        if (success) {
          console.log('\n✅ Deployment complete!');
          console.log(`\nNext steps:`);
          console.log(`1. Test the update: curl ${config.local?.serverUrl || config.custom?.serverUrl}/latest?channel=${channel}`);
          console.log(`2. Monitor analytics: node deploy-updates.js analytics 1`);
          console.log(`3. Increase rollout: node deploy-updates.js rollout ${channel} 50`);
        }
        break;
      }
      
      case 'rollout': {
        const channel = args[1];
        const percentage = parseInt(args[2]);
        
        if (!channel || isNaN(percentage)) {
          console.error('❌ Usage: rollout <channel> <percentage>');
          process.exit(1);
        }
        
        if (!['alpha', 'beta', 'stable'].includes(channel)) {
          console.error('❌ Invalid channel. Use: alpha, beta, or stable');
          process.exit(1);
        }
        
        if (percentage < 0 || percentage > 100) {
          console.error('❌ Percentage must be between 0 and 100');
          process.exit(1);
        }
        
        await increaseRollout(channel, percentage, config);
        break;
      }
      
      case 'rollback': {
        const channel = args[1];
        const version = args[2];
        
        if (!channel || !version) {
          console.error('❌ Usage: rollback <channel> <version>');
          process.exit(1);
        }
        
        if (!['alpha', 'beta', 'stable'].includes(channel)) {
          console.error('❌ Invalid channel. Use: alpha, beta, or stable');
          process.exit(1);
        }
        
        await triggerRollback(channel, version, config);
        break;
      }
      
      case 'analytics': {
        const days = parseInt(args[1]) || 7;
        await getAnalytics(days, config);
        break;
      }
      
      default:
        console.error('❌ Unknown command:', command);
        console.error('   Use: deploy, rollout, rollback, or analytics');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { deployLocal, deployS3, deployAzure, increaseRollout, triggerRollback };
