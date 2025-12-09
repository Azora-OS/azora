# C4 - Marketplace & Forge, Mint & Pay

## System View
- Purpose: Provide trustful, auditable, and compliant marketplace and payment flows with escrow, dispute resolution, and token minting tied to Proof-of-Value.

## Containers & Responsibilities
- Marketplace API (`services/azora-marketplace/`)
  - Job posting, job matchmaking, offer lifecycle, evidence capture.
- Escrow & Ledger (`services/azora-pay/`)
  - Double-entry ledger, escrow holds, payouts, reconciliation.
- Minting & Tokenization (`services/azora-mint/`)
  - NFT minting hooks, metadata, royalties, onchain/offchain sync.
- Reputation Service
  - Rating aggregation, reputation scoring, on-chain/off-chain proofs.
- Court/Dispute System
  - Intake, evidence submission, adjudication workflow, distribution of funds; integrates with Constitutional AI for proof requirements.

## Component View
- Marketplace Matcher
  - ML-based ranking model with a fallback deterministic matcher.
- Safe Escrow
  - Atomic operations across ledger & blockchain via 2-phase commit; support testnets for integration testing.
- Mint Gate
  - Checks for contribution eligibility and truth verification (via Constitutional Core) prior to minting.
- Royalties & Smart Contract Interface
  - Interact with chain (EVM) or other ledger, ensure safe signatures and private key handling by HSM/KMS.

## Data Model
- Offer {offerId, posterId, price, escrowState, timeline}
- Transaction {txId, ledgerEntryIds[], onchainTransactionId}
- Dispute {disputeId, initiator, evidence, state}

## Compliance & Security
- KYC/KYB for custodial wallets.
- AML checks for large transactions.
- Signed audit trails for disputes and payouts.

## Observability
- Metrics:
  - escrow_holds_count, payouts_total, dispute_rate, minting_success_rate
- Alerts on transaction reconciliation mismatches.

## Repo Cross References
- `services/azora-marketplace/`, `services/azora-pay/`, `services/azora-mint/` — main codebases.

## Acceptance Criteria
- Payments pass reconciliation tests with < 0.1% mismatch.
- Testnet minting & settlement succeed with proof logs full auditability.

## Next Steps
- Start with a payments & escrow MVP; add minting hooks with testnet integration.
- Work with legal to draft the dispute resolution workflow and terms of service.
