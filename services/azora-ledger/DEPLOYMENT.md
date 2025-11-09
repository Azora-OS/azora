# 🚀 Azora Ledger Deployment Guide

## Quick Deployment (10 minutes)

### Step 1: Install Dependencies (2 min)
```bash
cd services/azora-ledger
npm install
```

### Step 2: Configure Environment (1 min)
```bash
cp .env.example .env
```

Edit `.env`:
```env
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=1337
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here
```

### Step 3: Start Local Blockchain (2 min)
```bash
# Terminal 1: Start Hardhat node
npx hardhat node
```

### Step 4: Deploy Smart Contracts (3 min)
```bash
# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

Copy contract addresses to `.env`:
```env
AZR_TOKEN_ADDRESS=0x...
NFT_CERTIFICATE_ADDRESS=0x...
WALLET_ADDRESS=0x...
```

### Step 5: Test Integration (2 min)
```bash
npm run dev
```

## ✅ Verification

Test endpoints:
```bash
# Create wallet
curl -X POST http://localhost:4000/api/blockchain/wallet/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Check balance
curl http://localhost:4000/api/blockchain/wallet/0xYourAddress/balance

# Mint NFT
curl -X POST http://localhost:4000/api/blockchain/nft/mint \
  -H "Content-Type: application/json" \
  -d '{"certificate": {...}, "privateKey": "..."}'
```

## 🎉 Complete!

Blockchain integration deployed in 10 minutes:
- ✅ AZR Token contract deployed
- ✅ NFT Certificate contract deployed
- ✅ Wallet contract deployed
- ✅ API routes active
- ✅ Integration bridge connected

**Ubuntu activated. Blockchain ready.** 🚀
