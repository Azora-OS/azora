#!/usr/bin/env node

/**
 * AZORA SMART CONTRACT DEPLOYMENT SCRIPT
 * Deploys AZR token contract to Azora Chain with mining rewards
 */

const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🚀 Deploying AZORA Smart Contracts...\n');

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with account:', deployer.address);
    console.log('Account balance:', (await deployer.getBalance()).toString());

    // Deploy AzoraCoin (AZR) contract
    console.log('\n📄 Deploying AzoraCoin (AZR) contract...');
    const AzoraCoin = await ethers.getContractFactory('AzoraCoin');
    const azoraCoin = await AzoraCoin.deploy(deployer.address);

    await azoraCoin.deployed();
    console.log('✅ AzoraCoin deployed to:', azoraCoin.address);

    // Grant reward minter role to mining engine (if available)
    const rewardMinterRole = await azoraCoin.REWARD_MINTER_ROLE();
    console.log('🔑 Reward Minter Role:', rewardMinterRole);

    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        azoraCoin: {
            address: azoraCoin.address,
            deployer: deployer.address,
            deploymentTime: new Date().toISOString(),
            maxSupply: (await azoraCoin.MAX_SUPPLY()).toString(),
            totalSupply: (await azoraCoin.totalSupply()).toString()
        }
    };

    // Save to deployments file
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentFile}`);

    // Verify contract on Etherscan (if not localhost)
    if (network.name !== 'localhost' && network.name !== 'hardhat') {
        console.log('\n🔍 Verifying contract on Etherscan...');
        try {
            await run('verify:verify', {
                address: azoraCoin.address,
                constructorArguments: [deployer.address],
            });
            console.log('✅ Contract verified on Etherscan');
        } catch (error) {
            console.log('❌ Contract verification failed:', error.message);
        }
    }

    console.log('\n🎉 Deployment completed successfully!');
    console.log('📋 Summary:');
    console.log(`   AZR Token: ${azoraCoin.address}`);
    console.log(`   Max Supply: ${(await azoraCoin.MAX_SUPPLY()).toString()} wei`);
    console.log(`   Initial Supply: ${(await azoraCoin.totalSupply()).toString()} wei`);

    // Save environment variables for the mining engine
    const envContent = `
# AZORA Contract Addresses
AZR_CONTRACT_ADDRESS=${azoraCoin.address}
AZORA_CHAIN_ID=${network.config.chainId || 1337}
AZORA_RPC_URL=${network.config.url || 'http://localhost:8545'}

# Mining Engine Configuration
MINING_ENGINE_ADDRESS=${deployer.address}
REWARD_MINTER_ROLE=${rewardMinterRole}
`;

    const envFile = path.join(__dirname, '../.env.contracts');
    fs.writeFileSync(envFile, envContent.trim());
    console.log(`🔧 Environment variables saved to: ${envFile}`);

    return deploymentInfo;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    });