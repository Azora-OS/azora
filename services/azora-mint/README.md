# ⛓️ Azora Mint (Blockchain Service)

> **Auditable Ledger • Proof-of-Value • Tokenomics Engine**

[![Service Status](https://img.shields.io/badge/status-active-success.svg)](../../docs/launch-dashboard.html)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Overview

**Azora Mint** is the "Memory" of the ecosystem. It manages the immutable recording of all value-creating actions, enforcing the **Ubuntu Tokenomics** model. It ensures that every contribution is attributed, rewarded, and audited.

### Key Capabilities
- **Proof-of-Value (PoV)**: Validates and mints tokens for 5 types of value creation (Knowledge, Code, Community, etc.).
- **Auditable Mutation Ledger (AML)**: Records every system change and transaction hash.
- **CitadelFund**: Automatically diverts 10% of all transaction value to a public goods fund.
- **Attribution Tracking**: Ensures creators receive perpetual royalties.

## 🏗️ Architecture

```mermaid
graph TD
    Action[User Action] --> Validator[PoV Validator]
    Validator -->|Valid| Mint[Minting Engine]
    Mint --> Ledger[Blockchain Ledger]
    Mint --> Wallet[User Wallet]
    Mint --> Citadel[Citadel Fund (10%)]
```

## 🔌 API Endpoints

### Mining & Tokens
- `POST /api/mine` - Submit proof of value for mining
- `POST /api/transfer` - Transfer AZR tokens
- `GET /api/balance/:address` - Get wallet balance

### Ledger
- `GET /api/ledger/transaction/:hash` - Verify transaction integrity
- `GET /api/ledger/audit` - Get audit trail

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3011` |
| `BLOCKCHAIN_NETWORK` | Network ID | `azora-mainnet` |
| `CITADEL_ADDRESS` | Public goods wallet | `0xCitadel...` |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Redis (for mempool)

### Installation

```bash
# Install dependencies
npm install

# Start service
npm start
```

## 🧪 Testing

```bash
# Run blockchain validation tests
npm test
```

---

**"Value is not extracted, it is co-created."**
