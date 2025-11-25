/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA LEDGER - Main Export
Constitutional AI Blockchain Integration
*/

export { AzoraBlockchain, BlockchainConfig, NFTMetadata, AZRReward } from './blockchain-core';
export { WalletService, Wallet, Transaction } from './wallet-service';
export { NFTCertificateService, Certificate } from './nft-certificate-service';

import { AzoraBlockchain, BlockchainConfig } from './blockchain-core';
import { WalletService } from './wallet-service';
import { NFTCertificateService } from './nft-certificate-service';

export class AzoraLedger {
  public blockchain: AzoraBlockchain;
  public wallet: WalletService;
  public certificates: NFTCertificateService;

  constructor(config: BlockchainConfig) {
    this.blockchain = new AzoraBlockchain(config);
    this.wallet = new WalletService(this.blockchain);
    this.certificates = new NFTCertificateService(this.blockchain);
  }

  static create(config: BlockchainConfig): AzoraLedger {
    return new AzoraLedger(config);
  }
}

export const defaultConfig: BlockchainConfig = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || '1337'),
  contractAddresses: {
    azrToken: process.env.AZR_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
    nftCertificate: process.env.NFT_CERTIFICATE_ADDRESS || '0x0000000000000000000000000000000000000000',
    wallet: process.env.WALLET_ADDRESS || '0x0000000000000000000000000000000000000000'
  }
};

export const azoraLedger = AzoraLedger.create(defaultConfig);
