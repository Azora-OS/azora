# AZR Redemption Escrow Flow

This directory contains the scripts and contracts for the AZR token redemption escrow system.

## Overview

The redemption system allows users to escrow AZR tokens in exchange for fiat currency payments. The process uses a Gnosis Safe multisig for security and requires bank transfer confirmation before token release.

## Test Configuration (150 AZR)

- **AZR Contract**: `0x742d35Cc6634C0532925a3b844Bc454e4438f44e`
- **Chain ID**: 195 (Azora Mainnet)
- **Test Amount**: 150 AZR
- **Exchange Rate**: 1 AZR = $50 USD = 925 ZAR
- **Test Payout**: ZAR 138,750

## Files

### Contracts
- `contracts/Redemption.sol` - Main escrow contract

### Scripts
- `scripts/deploy-redemption.js` - Deploy the Redemption contract
- `scripts/propose-completeRedeem-safe.js` - Propose completion to Gnosis Safe

### Documentation
- `ops/payout-confirmation-150AZR.md` - Ops confirmation template

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export AZORA_RPC_URL="https://rpc.azora.network"
export BLOCKCHAIN_PRIVATE_KEY="your-private-key"
export AZR_ADDRESS="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
export GNOSIS_SAFE_ADDRESS="your-safe-address"
```

## Deployment

1. Deploy the Redemption contract:
```bash
npx hardhat run --network azora scripts/deploy-redemption.js
```

2. Note the deployed contract address and update the Ops confirmation.

## Workflow

1. **Ops Confirmation**: Get written confirmation from Ops accepting the test terms
2. **Deploy Contract**: Deploy Redemption contract with Gnosis Safe as admin
3. **Request Redemption**: Approve and request redemption with bank details
4. **Bank Transfer**: Ops initiates and confirms bank transfer
5. **Complete Redemption**: Propose multisig transaction to release tokens

## Security

- Admin is Gnosis Safe (multisig required)
- Tokens held in escrow until bank confirmation
- All transactions recorded on-chain
- Audit trail maintained

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AZORA_RPC_URL` | Azora network RPC URL | `https://rpc.azora.network` |
| `BLOCKCHAIN_PRIVATE_KEY` | Deployer private key | `0x...` |
| `AZR_ADDRESS` | AZR token contract | `0x742d35Cc6634C0532925a3b844Bc454e4438f44e` |
| `GNOSIS_SAFE_ADDRESS` | Gnosis Safe admin address | `0x...` |
| `REDEMPTION_ADDRESS` | Deployed redemption contract | `0x...` |
| `TREASURY_ADDRESS` | Token destination | `0x...` |
| `SAFE_OWNER_PRIVATE_KEY` | Safe owner for proposals | `0x...` |

## Commands

### Deploy Contract
```bash
npx hardhat run --network azora scripts/deploy-redemption.js
```

### Propose Completion
```bash
node scripts/propose-completeRedeem-safe.js
```

### Approve Tokens (Manual)
```javascript
// In browser console or script
await azrContract.approve(redemptionAddress, "150000000000000000000") // 150 * 10^18
```

### Request Redemption (Manual)
```javascript
await redemptionContract.requestRedeem("150000000000000000000", "Bank details here")
```