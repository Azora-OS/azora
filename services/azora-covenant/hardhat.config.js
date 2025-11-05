/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { task } from "hardhat/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

console.log("Loading Hardhat config...");

// Define the deploy task
console.log("Defining deploy-azora task...");
task("deploy-azora", "Deploy AzoraCoin contract")
  .setAction(async (taskArgs, hre) => {
    console.log("Running deploy task...");
    console.log("hre:", hre);
    console.log("hre.ethers:", hre.ethers);
    if (!hre.ethers) {
      throw new Error("hre.ethers is not available");
    }
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const AzoraCoin = await hre.ethers.getContractFactory("AzoraCoin");
    const azoraCoin = await AzoraCoin.deploy();

    await azoraCoin.waitForDeployment();

    const contractAddress = await azoraCoin.getAddress();
    console.log(`✅ AzoraCoin deployed at: ${contractAddress}`);

    return contractAddress;
  });
console.log("Task defined.");

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      type: "edr-simulated"
    },
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    mainnet: {
      type: "http",
      url: process.env.MAINNET_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 1,
    },
    polygon: {
      type: "http",
      url: process.env.POLYGON_RPC,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
