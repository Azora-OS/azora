/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Could not check balance:", error.message);
  }

  console.log("Deploying AzoraCoin...");

  const AzoraCoin = await hre.ethers.getContractFactory("AzoraCoin");
  const azoraCoin = await AzoraCoin.deploy();

  await azoraCoin.waitForDeployment();

  const contractAddress = await azoraCoin.getAddress();
  console.log(
    `✅ AzoraCoin (AZR) deployed successfully!`
  );
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log(`🔍 Block Explorer: https://${hre.network.name === 'sepolia' ? 'sepolia.' : ''}etherscan.io/address/${contractAddress}`);

  // Test basic functionality
  console.log("\nTesting contract functionality...");
  const name = await azoraCoin.name();
  const symbol = await azoraCoin.symbol();
  const totalSupply = await azoraCoin.totalSupply();
  const maxSupply = await azoraCoin.MAX_SUPPLY();
  const owner = await azoraCoin.owner();

  console.log(`📋 Token Name: ${name}`);
  console.log(`🏷️  Token Symbol: ${symbol}`);
  console.log(`💰 Total Supply: ${hre.ethers.formatEther(totalSupply)} AZR`);
  console.log(`🎯 Max Supply: ${hre.ethers.formatEther(maxSupply)} AZR`);
  console.log(`👑 Owner: ${owner}`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokenDetails: {
      name: name,
      symbol: symbol,
      totalSupply: hre.ethers.formatEther(totalSupply),
      maxSupply: hre.ethers.formatEther(maxSupply),
      owner: owner
    }
  };

  console.log("\n📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
