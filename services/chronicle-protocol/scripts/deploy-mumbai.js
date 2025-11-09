/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - MUMBAI TESTNET DEPLOYMENT SCRIPT
*/

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Colors for console output
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

async function deployChronicleProtocol() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.bright);
  log('🚀 CHRONICLE PROTOCOL - MUMBAI DEPLOYMENT', colors.bright + colors.blue);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.bright);

  try {
    // Load environment variables
    const rpcUrl = process.env.MUMBAI_RPC_URL;
    const privateKey = process.env.CHRONICLE_PRIVATE_KEY;

    if (!rpcUrl) {
      throw new Error('MUMBAI_RPC_URL not set in environment');
    }

    if (!privateKey || privateKey === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      throw new Error('CHRONICLE_PRIVATE_KEY not set or is placeholder value');
    }

    log('📡 Connecting to Polygon Mumbai Testnet...', colors.blue);
    log(`   RPC: ${rpcUrl}\n`);

    // Connect to network
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Check network
    const network = await provider.getNetwork();
    log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`, colors.green);
    log(`   Deployer: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);
    log(`   Balance: ${balanceInMatic} MATIC\n`);

    if (parseFloat(balanceInMatic) < 0.1) {
      log('⚠️  Warning: Low balance! You need at least 0.1 MATIC for deployment', colors.yellow);
      log('   Get testnet MATIC from: https://faucet.polygon.technology/\n', colors.yellow);
    }

    // Load contract source
    const contractPath = path.join(__dirname, '../../azora-covenant/contracts/ChronicleProtocol.sol');
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`Contract not found at: ${contractPath}`);
    }

    log('📄 Loading ChronicleProtocol contract...', colors.blue);

    // For this script to work, we need the compiled contract
    // In production, use Hardhat for compilation
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    
    log('⚠️  Note: This deployment requires pre-compiled contract artifacts', colors.yellow);
    log('   Run: cd ../azora-covenant && npx hardhat compile\n', colors.yellow);

    // Load compiled contract (assuming Hardhat artifacts)
    const artifactsPath = path.join(__dirname, '../../azora-covenant/artifacts/contracts/ChronicleProtocol.sol/ChronicleProtocol.json');
    
    if (!fs.existsSync(artifactsPath)) {
      throw new Error(
        'Contract artifacts not found. Please compile the contract first:\n' +
        '  cd services/azora-covenant && npx hardhat compile'
      );
    }

    const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    const contractAbi = contractArtifact.abi;
    const contractBytecode = contractArtifact.bytecode;

    log('📦 Deploying Chronicle Protocol contract...', colors.blue);
    log('   This may take 1-2 minutes...\n');

    // Create contract factory
    const factory = new ethers.ContractFactory(contractAbi, contractBytecode, wallet);

    // Estimate gas
    const deployTransaction = factory.getDeployTransaction();
    const gasEstimate = await provider.estimateGas(deployTransaction);
    const gasLimit = (gasEstimate * 120n) / 100n; // Add 20% buffer

    log(`   Estimated gas: ${gasEstimate.toString()}`);
    log(`   Gas limit: ${gasLimit.toString()}\n`);

    // Deploy contract
    const contract = await factory.deploy({ gasLimit });
    
    log('⏳ Transaction sent, waiting for confirmation...', colors.yellow);
    log(`   Transaction hash: ${contract.deploymentTransaction().hash}\n`);

    // Wait for deployment
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
    log('✅ DEPLOYMENT SUCCESSFUL!', colors.bright + colors.green);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.green);

    log(`📍 Contract Address: ${contractAddress}`, colors.bright);
    log(`🔍 View on PolygonScan: https://mumbai.polygonscan.com/address/${contractAddress}`);
    log(`🔗 Deployer: ${wallet.address}\n`);

    // Save deployment info
    const deploymentInfo = {
      network: 'mumbai',
      chainId: Number(network.chainId),
      contractAddress,
      deployer: wallet.address,
      transactionHash: contract.deploymentTransaction().hash,
      deployedAt: new Date().toISOString(),
      blockNumber: (await contract.deploymentTransaction().wait()).blockNumber,
    };

    const deploymentPath = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentPath)) {
      fs.mkdirSync(deploymentPath, { recursive: true });
    }

    const deploymentFile = path.join(deploymentPath, 'mumbai-deployment.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

    log(`💾 Deployment info saved to: ${deploymentFile}\n`, colors.green);

    // Update .env instructions
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.yellow);
    log('⚙️  NEXT STEPS', colors.bright + colors.yellow);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.yellow);

    log('1. Update your .env file with the contract address:', colors.yellow);
    log(`   CHRONICLE_CONTRACT_MUMBAI=${contractAddress}\n`, colors.bright);

    log('2. Verify the contract on PolygonScan (optional):', colors.yellow);
    log('   npm run verify:mumbai\n', colors.bright);

    log('3. Start the Chronicle Protocol service:', colors.yellow);
    log('   npm run dev\n', colors.bright);

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.yellow);

    return deploymentInfo;
  } catch (error) {
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('❌ DEPLOYMENT FAILED', colors.bright + colors.red);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.red);
    
    log(`Error: ${error.message}\n`, colors.red);

    if (error.message.includes('insufficient funds')) {
      log('💡 Solution: Get testnet MATIC from https://faucet.polygon.technology/', colors.yellow);
    } else if (error.message.includes('CHRONICLE_PRIVATE_KEY')) {
      log('💡 Solution: Set a valid private key in .env file', colors.yellow);
      log('   Generate with: node -e "console.log(\'0x\' + require(\'crypto\').randomBytes(32).toString(\'hex\'))"', colors.yellow);
    } else if (error.message.includes('Contract artifacts not found')) {
      log('💡 Solution: Compile the smart contract first:', colors.yellow);
      log('   cd services/azora-covenant && npx hardhat compile', colors.yellow);
    }

    log('');
    process.exit(1);
  }
}

// Run deployment
if (require.main === module) {
  deployChronicleProtocol()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployChronicleProtocol };
