export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId?: number;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  local: {
    name: 'local',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    chainId: 1337,
  },
  testnet: {
    name: 'testnet',
    rpcUrl: process.env.BLOCKCHAIN_TESTNET_RPC || 'https://rpc.testnet.local',
    chainId: 5,
  },
  mainnet: {
    name: 'mainnet',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL_MAINNET || 'https://mainnet.rpc',
    chainId: 1,
  },
};

export function getNetworkConfig(): NetworkConfig {
  const env = process.env.BLOCKCHAIN_NETWORK || 'local';
  return NETWORKS[env] || NETWORKS.local;
}

export default getNetworkConfig;
