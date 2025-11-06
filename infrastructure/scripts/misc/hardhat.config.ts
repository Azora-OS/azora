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

const config: HardhatUserConfig = {
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
      type: "edr-simulated",
      chainId: 1337
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      accounts: [PRIVATE_KEY]
    },
    azora: {
      type: "http",
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
