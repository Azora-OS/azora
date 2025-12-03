# 🚀 Quick Start: Deploy Smart Contracts

## Prerequisites
- Node.js 18+
- Polygon Mumbai testnet MATIC (get from faucet)
- Private key for deployment wallet

## Step 1: Get Mumbai MATIC (FREE)
Visit: https://faucet.polygon.technology/
- Connect your wallet
- Select "Mumbai" network
- Request test MATIC (0.5 MATIC)

## Step 2: Setup Environment
```bash
cd contracts

# Create .env file
cat > .env << 'EOF'
DEPLOYER_PRIVATE_KEY=your_private_key_here
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key (optional)
EOF

# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers dotenv
```

## Step 3: Deploy Contracts
```bash
# Deploy to Mumbai testnet
npx hardhat run scripts/deploy.js --network mumbai

# Output will show:
# ✅ AZRToken deployed to: 0x...
# ✅ NFTCertificate deployed to: 0x...
```

## Step 4: Verify Contracts (Optional)
```bash
# Verify AZRToken
npx hardhat verify --network mumbai <AZR_TOKEN_ADDRESS>

# Verify NFTCertificate
npx hardhat verify --network mumbai <NFT_CERTIFICATE_ADDRESS>
```

## Step 5: Update Services
The deployment script automatically updates `.env` with contract addresses.

Restart your services:
```bash
cd ..
docker-compose restart azora-blockchain azora-mint
```

## Testing
```bash
# Test AZR token minting
curl -X POST http://localhost:4000/api/mint/azr/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "amount": "100"
  }'

# Test NFT minting
curl -X POST http://localhost:4000/api/mint/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "tokenURI": "ipfs://QmXyz..."
  }'
```

## Troubleshooting

### Error: "insufficient funds"
- Get more Mumbai MATIC from faucet
- Check wallet balance: https://mumbai.polygonscan.com

### Error: "nonce too high"
- Reset Hardhat: `npx hardhat clean`
- Try again

### Error: "network not found"
- Check MUMBAI_RPC_URL in .env
- Try alternative RPC: https://matic-mumbai.chainstacklabs.com

## Next Steps
1. ✅ Contracts deployed
2. ✅ Services updated
3. Test blockchain integration
4. Deploy to Polygon mainnet (when ready)

## Mainnet Deployment (Production)
```bash
# Get real MATIC (buy on exchange)
# Update .env with mainnet RPC
# Deploy to mainnet
npx hardhat run scripts/deploy.js --network polygon

# IMPORTANT: Save contract addresses securely!
```
