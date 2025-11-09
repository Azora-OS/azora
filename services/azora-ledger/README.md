# 🔗 Azora Ledger - Blockchain Integration

**Constitutional AI Blockchain System**

## 🎯 Overview

Azora Ledger provides complete blockchain integration for the Constitutional AI Operating System:

- **💰 AZR Token**: Native cryptocurrency for Proof-of-Knowledge rewards
- **🎓 NFT Certificates**: Blockchain-verified educational credentials
- **👛 Multi-Currency Wallets**: AZR, BTC, ETH, USD support
- **🔐 Constitutional Hashing**: Immutable record verification

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your blockchain configuration
```

### 3. Deploy Smart Contracts
```bash
npm run deploy:contracts
```

### 4. Start Service
```bash
npm run dev
```

## 📦 Components

### Blockchain Core
- NFT certificate minting
- AZR token rewards
- Wallet balance queries
- Certificate verification

### Wallet Service
- Multi-currency wallet creation
- Balance management
- Transfers and transactions
- Proof-of-Knowledge rewards

### NFT Certificate Service
- Educational credential minting
- Blockchain verification
- Constitutional hashing
- Metadata management

## 🔌 API Integration

```typescript
import { azoraLedger } from '@azora/ledger';

// Create wallet
const wallet = await azoraLedger.wallet.createWallet(userId);

// Mint NFT certificate
const txHash = await azoraLedger.certificates.mintCertificate(certificate, privateKey);

// Reward AZR tokens
const tx = await azoraLedger.wallet.rewardProofOfKnowledge(userId, amount, proof, privateKey);

// Get balance
const balances = await azoraLedger.wallet.getBalance(address);
```

## 🛡️ Smart Contracts

### AZRToken.sol
ERC-20 token for Azora ecosystem rewards

### AzoraCertificateNFT.sol
ERC-721 NFT for educational credentials

### AzoraWallet.sol
Multi-signature wallet with Ubuntu principles

## 🌐 API Endpoints

### Wallet
- `POST /api/blockchain/wallet/create` - Create new wallet
- `GET /api/blockchain/wallet/:address/balance` - Get balance
- `POST /api/blockchain/wallet/transfer` - Transfer tokens

### NFT Certificates
- `POST /api/blockchain/nft/mint` - Mint certificate
- `GET /api/blockchain/nft/:tokenId/verify` - Verify certificate
- `GET /api/blockchain/nft/:tokenId/metadata` - Get metadata

### Rewards
- `POST /api/blockchain/rewards/mint` - Mint AZR rewards

## 💎 Ubuntu Philosophy

*"My success enables your success"*

Every blockchain transaction strengthens the collective:
- Learning rewards circulate prosperity
- Certificates verify collective knowledge
- Wallets enable sovereign participation

---

**Azora ES (Pty) Ltd**  
Constitutional AI Operating System
