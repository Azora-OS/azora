<<<<<<< HEAD
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";

export default {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org", // Free Sepolia RPC
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.BLOCKCHAIN_RPC,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
=======
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY]
    },
    azora: {
      url: process.env.AZORA_RPC_URL || "https://rpc.azora.network",
      accounts: [PRIVATE_KEY],
      chainId: 195,
      gasPrice: 20000000000, // 20 gwei
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
>>>>>>> f67f6e62a0323d30efb3d00a3a59b0e992007c75
