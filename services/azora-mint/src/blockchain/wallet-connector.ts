/**
 * Wallet Connector
 * Manages wallet connections and user interactions
 */

import { ethers } from 'ethers';

export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance: string;
  provider: string;
}

export interface SigningRequest {
  id: string;
  message: string;
  address: string;
  status: 'pending' | 'signed' | 'rejected';
  signature?: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface TransactionRequest {
  id: string;
  to: string;
  value: string;
  data?: string;
  gasLimit?: string;
  status: 'pending' | 'approved' | 'rejected' | 'confirmed';
  hash?: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * In-memory storage for requests
 */
const signingRequests = new Map<string, SigningRequest>();
const transactionRequests = new Map<string, TransactionRequest>();

/**
 * Connect to MetaMask or other Web3 wallet
 */
export async function connectWallet(): Promise<WalletConnection> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found. Please install MetaMask or similar.');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const address = accounts[0];

    // Get chain ID
    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex, 16);

    // Get balance
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);

    return {
      address,
      chainId,
      isConnected: true,
      balance: ethers.formatEther(balance),
      provider: 'MetaMask',
    };
  } catch (error) {
    throw new Error(`Wallet connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Disconnect wallet
 */
export function disconnectWallet(): void {
  // Clear any stored connection data
  signingRequests.clear();
  transactionRequests.clear();
}

/**
 * Switch network
 */
export async function switchNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found');
  }

  try {
    const chainIdHex = `0x${chainId.toString(16)}`;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: any) {
    // If chain not added, add it
    if (error.code === 4902) {
      await addNetwork(chainId);
    } else {
      throw new Error(`Network switch failed: ${error.message}`);
    }
  }
}

/**
 * Add network to wallet
 */
export async function addNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found');
  }

  // Polygon Mumbai testnet
  if (chainId === 80001) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x13881',
          chainName: 'Polygon Mumbai',
          rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          blockExplorerUrls: ['https://mumbai.polygonscan.com'],
        },
      ],
    });
  }
  // Polygon mainnet
  else if (chainId === 137) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x89',
          chainName: 'Polygon',
          rpcUrls: ['https://polygon-rpc.com'],
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          blockExplorerUrls: ['https://polygonscan.com'],
        },
      ],
    });
  }
}

/**
 * Request signature
 */
export async function requestSignature(message: string, address: string): Promise<SigningRequest> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found');
  }

  const request: SigningRequest = {
    id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    address,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  };

  signingRequests.set(request.id, request);

  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });

    request.signature = signature;
    request.status = 'signed';

    return request;
  } catch (error) {
    request.status = 'rejected';
    throw new Error(`Signature request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Request transaction approval
 */
export async function requestTransaction(
  to: string,
  value: string,
  data?: string
): Promise<TransactionRequest> {
  if (!window.ethereum) {
    throw new Error('No Web3 wallet found');
  }

  const request: TransactionRequest = {
    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    to,
    value,
    data,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  };

  transactionRequests.set(request.id, request);

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts connected');
    }

    const hash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to,
          value: ethers.parseEther(value).toString(),
          data,
        },
      ],
    });

    request.hash = hash;
    request.status = 'approved';

    return request;
  } catch (error) {
    request.status = 'rejected';
    throw new Error(`Transaction request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get signing request
 */
export function getSigningRequest(id: string): SigningRequest | null {
  return signingRequests.get(id) || null;
}

/**
 * Get transaction request
 */
export function getTransactionRequest(id: string): TransactionRequest | null {
  return transactionRequests.get(id) || null;
}

/**
 * Get current wallet connection
 */
export async function getCurrentConnection(): Promise<WalletConnection | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    const chainIdHex = await window.ethereum.request({
      method: 'eth_chainId',
    });
    const chainId = parseInt(chainIdHex, 16);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(accounts[0]);

    return {
      address: accounts[0],
      chainId,
      isConnected: true,
      balance: ethers.formatEther(balance),
      provider: 'MetaMask',
    };
  } catch (error) {
    return null;
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): void {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): void {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
}

/**
 * Remove listeners
 */
export function removeListeners(): void {
  if (window.ethereum) {
    window.ethereum.removeAllListeners();
  }
}

/**
 * Check if wallet is connected
 */
export async function isWalletConnected(): Promise<boolean> {
  const connection = await getCurrentConnection();
  return connection !== null && connection.isConnected;
}

/**
 * Get wallet provider
 */
export function getWalletProvider(): ethers.BrowserProvider | null {
  if (!window.ethereum) {
    return null;
  }

  return new ethers.BrowserProvider(window.ethereum);
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default {
  connectWallet,
  disconnectWallet,
  switchNetwork,
  addNetwork,
  requestSignature,
  requestTransaction,
  getSigningRequest,
  getTransactionRequest,
  getCurrentConnection,
  onAccountsChanged,
  onChainChanged,
  removeListeners,
  isWalletConnected,
  getWalletProvider,
};
