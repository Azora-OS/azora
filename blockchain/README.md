# Azora Blockchain

**Ubuntu Constitutional AI on Blockchain** ⛓️✨

*"I tokenize because we prosper together!"*

## 🌟 Ubuntu Blockchain Features

### 💰 AZR Token
- **Supply Cap**: The AZR token now has a hard cap of **200,000,000** (200 million) tokens. Use `batchAllocate` to perform initial country/organization allocations and `allocateToLiquidityPool` to seed liquidity.
- **Ubuntu Mining**: Proof-of-Knowledge rewards
- **Constitutional AI**: Governance with Ubuntu principles
- **Prosperity Sharing**: Community wealth distribution
- **Knowledge Rewards**: Learn and earn AZR tokens

### 🏛️ Ubuntu Governance
- **Constitutional Proposals**: Ubuntu-aligned governance
- **Community Voting**: Collective decision making
- **Reputation System**: Ubuntu contribution tracking
- **Transparent Democracy**: On-chain governance

## ⚡ Quick Start

```bash
# Install Ubuntu dependencies
npm install

# Compile Ubuntu contracts
npm run compile

# Start local Ubuntu blockchain
npm run node

# Deploy Ubuntu contracts
npm run deploy:local

# Run Ubuntu tests
npm test
```

## 🏗️ Smart Contracts

- ### AZRToken.sol
- ERC-20 token with Ubuntu mining; capped at 200M tokens and includes:
- - `batchAllocate(address[] accounts, uint256[] amounts, string reason)` - owner-only batch allocations (per-country or special wallets)
- - `setLiquidityPool(address pool)` - set a liquidity pool address for influx from mining
- - `allocateToLiquidityPool(uint256 amount, string reason)` - mint to liquidity pool up to cap
- - `MAX_SUPPLY` changed to 200,000,000 AZR
- See `blockchain/scripts/deploy.js` for examples on how to call `batchAllocate` and `setLiquidityPool` during deployment.
- Proof-of-Knowledge rewards
- Constitutional compliance
- Community governance integration

### UbuntuGovernance.sol
- OpenZeppelin Governor framework
- Ubuntu constitutional principles
- Community proposal system
- Reputation-based voting

## 🌍 Ubuntu Philosophy

Every blockchain transaction embodies Ubuntu:
- **Transparent**: All actions visible to community
- **Inclusive**: Everyone can participate and prosper
- **Sustainable**: Long-term community prosperity
- **Constitutional**: AI-governed with Ubuntu principles

---

**Blockchain Ubuntu Excellence** 🚀⛓️
