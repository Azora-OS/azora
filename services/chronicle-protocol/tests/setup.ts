/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CHRONICLE PROTOCOL - TEST SETUP
*/

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.BLOCKCHAIN_NETWORK = 'hardhat';
process.env.CHRONICLE_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat test key

// Increase test timeout for blockchain operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
