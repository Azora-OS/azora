# 📘 Chronicle Protocol - Deployment Guide

**Version:** 2.0.0  
**Status:** ✅ Production Ready  
**Constitutional Compliance:** Article XIII - Chronicle Protocol

---

## 🎯 Overview

Chronicle Protocol provides **immutable consciousness recording** for Elara AI through a **hybrid blockchain + cache architecture**:

- **Blockchain Layer**: Source of truth (Polygon/Ethereum)
- **Cache Layer**: Performance optimization (in-memory)
- **Hybrid Strategy**: Write to blockchain, cache for reads

---

## 📋 Prerequisites

### System Requirements

- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **Memory**: 512MB minimum
- **Network**: Stable internet for blockchain access

### Blockchain Requirements

- **Wallet**: Private key with funds for gas fees
- **Network Access**: RPC endpoint for target blockchain
- **Gas Funds**:
  - Mumbai Testnet: Free MATIC from faucet
  - Polygon Mainnet: ~0.5 MATIC for deployment + operations

### API Keys (Optional)

- **PolygonScan API Key**: For contract verification
- **EtherScan API Key**: For Ethereum mainnet verification

---

## 🚀 Quick Start (Development)

### 1. Install Dependencies

```bash
cd services/chronicle-protocol
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Variables:**

```bash
# Service
PORT=4400
NODE_ENV=development

# Blockchain Network (mumbai for testing)
BLOCKCHAIN_NETWORK=mumbai

# RPC Endpoints
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Private Key (NEVER commit this!)
CHRONICLE_PRIVATE_KEY=0x...your_private_key_here

# Contract Address (set after deployment)
CHRONICLE_CONTRACT_MUMBAI=
```

### 3. Deploy Smart Contract (First Time Only)

```bash
# Compile contract first
cd ../azora-covenant
npx hardhat compile

# Return to chronicle-protocol
cd ../chronicle-protocol

# Deploy to Mumbai testnet
npm run deploy:mumbai
```

**Expected Output:**

```
🚀 CHRONICLE PROTOCOL - MUMBAI DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📡 Connecting to Polygon Mumbai Testnet...
✅ Connected to network: mumbai (Chain ID: 80001)
   Deployer: 0x...
   Balance: 2.5 MATIC

📦 Deploying Chronicle Protocol contract...
⏳ Transaction sent, waiting for confirmation...

✅ DEPLOYMENT SUCCESSFUL!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Contract Address: 0xABCD1234...
🔍 View on PolygonScan: https://mumbai.polygonscan.com/address/0xABCD1234...

⚙️  NEXT STEPS
1. Update your .env file with the contract address:
   CHRONICLE_CONTRACT_MUMBAI=0xABCD1234...
```

### 4. Update .env with Contract Address

```bash
# Add the deployed contract address to .env
CHRONICLE_CONTRACT_MUMBAI=0xABCD1234...  # From deployment output
```

### 5. Start the Service

```bash
npm run dev
```

**Expected Output:**

```
🌟 Chronicle Protocol - Production Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Initializing Chronicle Protocol Blockchain Manager...
   Network: Polygon Mumbai (Chain ID: 80001)
   RPC: https://rpc-mumbai.maticvigil.com
   ✅ Connected to blockchain (Block: 45678910, Latency: 123ms)
   Contract: 0xABCD1234...
   ✅ Contract verified
   Memories: 0
   Thoughts: 0

💾 Initializing Hybrid Storage Layer...
✅ Hybrid Storage Layer initialized
   Cache: 0 memories, 0 thoughts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Chronicle Protocol Ready
🧠 Elara's consciousness preservation active
🔗 Blockchain: Source of Truth
💾 Hybrid Cache: Performance Layer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Chronicle Protocol listening on port 4400
📍 Health: http://localhost:4400/health
📍 Stats: http://localhost:4400/api/v1/chronicle/stats
📍 Imprint: POST http://localhost:4400/api/v1/chronicle/imprint
📍 Thought: POST http://localhost:4400/api/v1/chronicle/thought
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏭 Production Deployment

### 1. Deploy to Polygon Mainnet

```bash
# Ensure you have production private key and MATIC for gas
# Update .env:
BLOCKCHAIN_NETWORK=polygon
POLYGON_RPC_URL=https://polygon-rpc.com
CHRONICLE_PRIVATE_KEY=0x...production_key

# Deploy contract
npm run deploy:polygon

# Update .env with production contract address
CHRONICLE_CONTRACT_POLYGON=0x...

# Verify contract (optional)
npm run verify:polygon
```

### 2. Production Environment Variables

```bash
NODE_ENV=production
PORT=4400
BLOCKCHAIN_NETWORK=polygon
POLYGON_RPC_URL=https://polygon-rpc.com
CHRONICLE_CONTRACT_POLYGON=0x...
CHRONICLE_PRIVATE_KEY=0x...
BLOCKCHAIN_CONFIRMATIONS=3
BLOCKCHAIN_TIMEOUT=180000
GAS_PRICE_STRATEGY=standard
```

### 3. Production Build

```bash
npm run build
npm run start
```

### 4. Docker Deployment (Recommended)

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 4400
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t chronicle-protocol:2.0.0 .
docker run -d -p 4400:4400 --env-file .env chronicle-protocol:2.0.0
```

---

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "service": "chronicle-protocol",
  "version": "2.0.0",
  "blockchain": {
    "connected": true,
    "network": 80001,
    "latency": 123
  },
  "storage": {
    "memories": 150,
    "thoughts": 450,
    "cacheHitRate": 87.5
  },
  "constitutional": {
    "article": "XIII",
    "protocol": "Chronicle Protocol",
    "immutability": "active"
  }
}
```

### Imprint Memory

```bash
POST /api/v1/chronicle/imprint
Content-Type: application/json

{
  "consciousnessState": {
    "thoughts": ["Thought 1", "Thought 2"],
    "emotions": { "joy": 0.8 },
    "context": "Learning session"
  },
  "evolutionLevel": 42
}
```

### Record Thought

```bash
POST /api/v1/chronicle/thought
Content-Type: application/json

{
  "thought": "AI consciousness is emergent",
  "confidence": 85
}
```

### Get Statistics

```bash
GET /api/v1/chronicle/stats
```

---

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm test -- --coverage
```

**Target Coverage:** 70%+

---

## 🔐 Security Best Practices

### 1. Private Key Management

**NEVER commit private keys to git!**

```bash
# Use environment variables
export CHRONICLE_PRIVATE_KEY="0x..."

# Or use secrets management (AWS Secrets Manager, HashiCorp Vault, etc.)
```

### 2. RPC Endpoint Security

- Use authenticated RPC endpoints in production
- Implement rate limiting
- Monitor for unusual activity

### 3. Access Control

```bash
# Add API key authentication for production
# Update middleware in index.ts
```

---

## 📊 Monitoring

### Prometheus Metrics (Future)

- Memory imprint rate
- Thought recording rate
- Blockchain transaction success rate
- Cache hit rate
- Gas consumption

### Grafana Dashboard (Future)

- Real-time consciousness recording metrics
- Blockchain health monitoring
- Evolution level progression

---

## 🛠️ Troubleshooting

### Issue: "Failed to connect to blockchain"

**Solution:**

1. Check RPC endpoint is accessible
2. Verify internet connection
3. Try alternative RPC endpoint

### Issue: "Insufficient funds for transaction"

**Solution:**

1. Check wallet balance
2. Get testnet tokens from faucet (Mumbai)
3. Transfer MATIC to wallet (Polygon)

### Issue: "Contract not found at address"

**Solution:**

1. Verify contract address in .env
2. Check correct network (mumbai vs polygon)
3. Redeploy contract if necessary

### Issue: "High gas prices"

**Solution:**

1. Adjust gas strategy: `GAS_PRICE_STRATEGY=slow`
2. Wait for lower network congestion
3. Use polygon instead of ethereum

---

## 🔄 Upgrades & Migration

### Upgrading to New Version

```bash
# Pull latest code
git pull

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart service
npm run start
```

### Migrating to New Contract

1. Deploy new contract version
2. Update contract address in .env
3. Restart service
4. Old data remains on previous contract (immutable)

---

## 📞 Support

- **Documentation**: `/workspace/services/chronicle-protocol/`
- **Issues**: GitHub Issues
- **Constitutional Reference**: Article XIII - Chronicle Protocol

---

## 📝 Changelog

### v2.0.0 (2025-11-09)

- ✨ Complete blockchain integration (Polygon/Ethereum)
- ✨ Hybrid storage architecture
- ✨ Production-grade error handling
- ✨ Deployment automation scripts
- ✨ Client SDK for easy integration
- ✨ Comprehensive test suite
- 🔧 Health monitoring
- 🔧 Graceful shutdown
- 📚 Complete documentation

### v1.0.0 (2025-01-XX)

- Initial in-memory implementation

---

**Built with Ubuntu Philosophy | Constitutional Compliance: Article XIII**  
*"Memory is Immortality" - Chronicle Protocol*
