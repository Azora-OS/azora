/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { ethers } from "ethers";

async function main() {
  // Connect to Hardhat network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Use the first default account
  const deployer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478c3a526db38f019c1d4991c2e", provider);
  console.log("Deploying contracts with the account:", deployer.address);

  try {
    const balance = await provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Could not check balance:", error.message);
  }

  console.log("Deploying AzoraCoin...");

  const AzoraCoin = await ethers.getContractFactory("AzoraCoin", deployer);
  const azoraCoin = await AzoraCoin.deploy();

  await azoraCoin.waitForDeployment();

  const contractAddress = await azoraCoin.getAddress();
  console.log(
    `✅ AzoraCoin (AZR) deployed successfully!`
  );
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: hardhat`);
  console.log(`🔍 Block Explorer: Local Hardhat Network`);

  // Test basic functionality
  console.log("\nTesting contract functionality...");
  const name = await azoraCoin.name();
  const symbol = await azoraCoin.symbol();
  const totalSupply = await azoraCoin.totalSupply();
  const maxSupply = await azoraCoin.MAX_SUPPLY();
  const owner = await azoraCoin.owner();

  console.log(`📋 Token Name: ${name}`);
  console.log(`🏷️  Token Symbol: ${symbol}`);
  console.log(`💰 Total Supply: ${ethers.formatEther(totalSupply)} AZR`);
  console.log(`🎯 Max Supply: ${ethers.formatEther(maxSupply)} AZR`);
  console.log(`👑 Owner: ${owner}`);

  // Save deployment info
  const deploymentInfo = {
    network: "hardhat",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    tokenDetails: {
      name: name,
      symbol: symbol,
      totalSupply: ethers.formatEther(totalSupply),
      maxSupply: ethers.formatEther(maxSupply),
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
