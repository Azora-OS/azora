/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - CONTRACT VERIFICATION SCRIPT
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function verifyContract(network) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright);
  log(`🔍 CHRONICLE PROTOCOL - CONTRACT VERIFICATION (${network.toUpperCase()})`, colors.bright + colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.bright);

  try {
    // Load deployment info
    const deploymentPath = path.join(__dirname, `../deployments/${network}-deployment.json`);
    
    if (!fs.existsSync(deploymentPath)) {
      throw new Error(`Deployment info not found for ${network}. Deploy the contract first.`);
    }

    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contractAddress = deploymentInfo.contractAddress;

    log(`📍 Contract Address: ${contractAddress}`, colors.blue);
    log(`🌐 Network: ${network}\n`);

    // Get API key
    const apiKey = network === 'mumbai' || network === 'polygon'
      ? process.env.POLYGONSCAN_API_KEY
      : process.env.ETHERSCAN_API_KEY;

    if (!apiKey) {
      throw new Error(
        `API key not found. Set ${network === 'mumbai' || network === 'polygon' ? 'POLYGONSCAN_API_KEY' : 'ETHERSCAN_API_KEY'} in .env`
      );
    }

    // Load contract source
    const contractPath = path.join(__dirname, '../../azora-covenant/contracts/ChronicleProtocol.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    log('📝 Preparing verification...', colors.blue);
    
    // API endpoints
    const apiEndpoints = {
      mumbai: 'api-testnet.polygonscan.com',
      polygon: 'api.polygonscan.com',
      mainnet: 'api.etherscan.io',
    };

    const apiHost = apiEndpoints[network];
    if (!apiHost) {
      throw new Error(`Unknown network: ${network}`);
    }

    // Prepare verification request
    const verificationData = {
      apikey: apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: contractAddress,
      sourceCode: contractSource,
      codeformat: 'solidity-single-file',
      contractname: 'ChronicleProtocol',
      compilerversion: 'v0.8.0+commit.c7dfd78e', // Match your Solidity version
      optimizationUsed: 0,
      runs: 200,
    };

    log('📤 Submitting verification request...\n', colors.blue);

    // Note: This is a simplified example
    // In production, use proper API libraries and handle all edge cases
    
    log('⚠️  Manual Verification Required', colors.yellow);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.yellow);

    const explorerUrls = {
      mumbai: `https://mumbai.polygonscan.com/address/${contractAddress}#code`,
      polygon: `https://polygonscan.com/address/${contractAddress}#code`,
      mainnet: `https://etherscan.io/address/${contractAddress}#code`,
    };

    log('📋 Verification Instructions:\n', colors.bright);
    log(`1. Visit: ${explorerUrls[network]}`, colors.blue);
    log(`2. Click "Verify and Publish"`, colors.blue);
    log(`3. Fill in the following details:\n`, colors.blue);
    
    log(`   Compiler Type: Solidity (Single file)`, colors.bright);
    log(`   Compiler Version: v0.8.0+commit.c7dfd78e`, colors.bright);
    log(`   License Type: MIT`, colors.bright);
    log(`   Optimization: No\n`, colors.bright);

    log(`4. Paste contract source from:`, colors.blue);
    log(`   ${contractPath}\n`, colors.bright);

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.yellow);

    // Save verification instructions
    const instructionsPath = path.join(__dirname, `../deployments/${network}-verification-instructions.txt`);
    const instructions = `
Chronicle Protocol Contract Verification Instructions
=====================================================

Network: ${network}
Contract Address: ${contractAddress}
Explorer URL: ${explorerUrls[network]}

Verification Steps:
1. Visit the explorer URL above
2. Click "Verify and Publish"
3. Use these settings:
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.0+commit.c7dfd78e
   - License Type: MIT
   - Optimization: No

4. Paste the contract source from:
   ${contractPath}

5. Submit and wait for verification to complete

Deployment Info:
- Deployed at: ${deploymentInfo.deployedAt}
- Transaction: ${deploymentInfo.transactionHash}
- Block: ${deploymentInfo.blockNumber}
- Deployer: ${deploymentInfo.deployer}
`;

    fs.writeFileSync(instructionsPath, instructions);
    log(`💾 Instructions saved to: ${instructionsPath}\n`, colors.green);

  } catch (error) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('❌ VERIFICATION FAILED', colors.bright + colors.red);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.red);
    
    log(`Error: ${error.message}\n`, colors.red);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  const network = process.argv[2] || 'mumbai';
  
  verifyContract(network)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyContract };
