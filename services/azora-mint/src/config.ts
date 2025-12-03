import dotenv from 'dotenv';

dotenv.config();

export const config = {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '31337', 10),
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY,
    contracts: {
        azrToken: process.env.CONTRACT_AZR_TOKEN || '',
        nftCertificate: process.env.CONTRACT_NFT_CERTIFICATE || '',
    },
};
