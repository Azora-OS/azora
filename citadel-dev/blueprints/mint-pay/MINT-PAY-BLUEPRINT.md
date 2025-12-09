# Mint & Pay – Domain Blueprint (Deep Dive)

> Status: Draft v0.1  
> Linked master docs:  
> - `citadel-dev/MASTER-ARCHITECTURE-BLUEPRINT.md` (Mint & Pay, PoV hooks)  
> - `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (PAY-*, MP-2.*, LIB-7.1, SAP-3/4, CAI-*, DATA-*)

Mint & Pay is Azora’s **financial & value layer**: wallets, ledgers, payouts, rewards, compliance, and their bridges to AZR on-chain.

---

## 1. Mission & Benchmarks

**Mission**: Provide a secure, auditable **Fort Knox / reserve bank for Azora** and value system where:

- Learners, educators, builders, and researchers earn and spend tokens (AZR + fiat equivalents) for meaningful contributions.  
- Organizations can fund programs, jobs, and research with confidence.  
- All flows respect legal, regulatory, and constitutional constraints.

**Benchmarks**:

- Reliability & UX comparable to modern consumer wallets and payout systems (Stripe, PayPal, Wise) but tied to Azora’s PoV system.  
- Accounting and auditability comparable to enterprise‑grade ledgers and neobank backends.

> Assumption P‑A1: AZR is the core ecosystem token (on-chain), while off‑chain balances may include multiple currencies (AZR, stablecoins, fiat). Fiat integration is via regulated providers.

---

## 2. C4 Views

### 2.1 System Context

**Actors**:

- **User** (learner, educator, builder, researcher) – earns rewards, receives payments, pays for services.  
- **Client / Enterprise** – funds jobs, programs, and licenses; manages budgets.  
- **Treasury / Citadel** – manages ecosystem‑level minting, rewards, and reserves.  
- **Regulators / Auditors** – consume reports; may inspect data for compliance.  
- **External Payments Providers** – Stripe/fiat rails, custody services, KYC/AML.

**Systems**:

- **Mint & Pay Service** – canonical ledger, wallets, payouts, invoices, and reporting.  
- **PoV Processor** – converts contribution events into rewards instructions.  
- **AZRToken & UbuntuGovernance** – on-chain token and governance.  
- **Marketplace & Forge** – sources of paid work and royalties.  
- **Sapiens & Library & Research Center** – sources of PoV events and educational grants.

### 2.2 Container View

Key containers:

- **Mint & Pay API** (`services/mint-pay/` – planned)
  - Manages Wallets, Transactions, TokenBalances, TokenTransactions, TokenRedemption (extending Prisma models).  
  - Exposes APIs for balances, transfers, payouts, PoV rewards, and reports.

- **On‑Chain Bridge** (`services/onchain-bridge/` – planned)
  - Bridges internal ledger with `blockchain/AZRToken.sol` and governance contracts.  
  - Manages minting/burning on-chain where appropriate.

- **Compliance & Reporting Service** (`services/compliance-reporter/` – planned)
  - Generates statements, regulatory reports, and audit trails for financial and PoV flows.

- **PoV Processor** (`services/pov-processor/` – planned, shared domain)
  - Consumes events from Sapiens, BuildSpaces, Library, Marketplace.  
  - Applies policy‑as‑code rules to issue PoV and reward instructions.

- **Frontends**:
  - Wallet & earnings views in `apps/azora-buildspaces/` and profile dashboards.  
  - **Fort Knox / Treasury console** in `apps/azora-mint/` for monetary policy, reserves management, and treasury operations.  
  - **Payments console** in `apps/azora-pay/` for checkouts, invoices, and payouts.  
  - **Financial analytics** in `apps/azora-finance/` and Enterprise Suite for risk, compliance, and PoV economics.  

### 2.3 Treasury / Fort Knox Role

- Mint & Pay together with `blockchain/AZRToken.sol` form Azora's **Fort Knox** or reserve bank: the canonical source of monetary policy and supply.  
- The **Treasury / Citadel** actor uses Mint & Pay and the On‑Chain Bridge to:  
  - Define and execute minting policies for mining, PoV rewards, and ecosystem programs.  
  - Define and execute burn policies for service usage and sinks across Sapiens, Library, Marketplace, Enterprise, CSI, and other domains.  
- Off‑chain ledger entries remain the **detailed accounting source of truth** for flows; on‑chain AZR supply and transfers are reconciled via the On‑Chain Bridge and reconciliation jobs.  

---

## 3. Domain Model

Leverages and extends existing Prisma models from `prisma/schema.prisma`:

### 3.1 Core Financial Entities

- `Wallet` – per user and currency, with balance and address (already modeled).  
- `Transaction` – ledger entries tied to Wallet (DEPOSIT, WITHDRAWAL, TRANSFER, MINING_REWARD, PAYMENT, REFUND, CREDIT, DEBIT).  
- `MiningActivity` – proofs of activity that generate rewards (course completion, assessments, peer teaching, content creation, community contribution).

### 3.2 Token & Rewards Entities

- `TokenBalance` – aggregate of token holdings per user.  
- `TokenTransaction` – detailed PoV token events (EARN, REDEEM, TRANSFER, BONUS, PENALTY).  
- `TokenRedemption` – redemption requests and statuses.

These represent **off‑chain** token accounting; AZRToken is **on‑chain** and must be reconciled.

### 3.3 Subscriptions & Enterprise

- `Subscription`, `BillingHistory`, `SubscriptionTierConfig` – subscription and pricing models.  
- `EnterpriseLicense`, `EnterpriseUsageTracking` – org‑level entitlements and usage.

Mint & Pay must integrate these into billing and reporting.

### 3.4 Events

Domain events (examples):

- `WalletCreated`, `FundsDeposited`, `PaymentSucceeded`, `RefundIssued`.  
- `PoVMinted`, `PoVRedeemed`, `AZRMintedOnChain`, `AZRBridgedOffChain`.  
- `InvoiceGenerated`, `ReportExported`.

These flow via Kafka to compliance, analytics, and governance systems.

---

## 4. Runtime Topology & Scaling

- **Ledger & wallets**:  
  - Stateless Mint & Pay API layer + Postgres ledger; Redis for idempotency and hot keys.  
  - Strong transactional guarantees (ACID) for financial operations.
- **On‑chain bridge**:  
  - Runs in controlled environment with restricted key management (HSM/KMS).  
  - Queues mint/burn/reconciliation jobs.
- **External providers**:  
  - Stripe‑like providers for fiat on/off‑ramp.  
  - Webhooks and idempotent handlers for provider events.
- **Scaling**:  
  - Transaction volume scaling through partitioned tables, indexes, and asynchronous processing for secondary tasks (notifications, analytics).

---

## 5. Security, Compliance, and Risk

- **Security**:
  - HSM/KMS‑backed key storage; no raw private keys in application memory when avoidable.  
  - Strict RBAC for treasury and admin operations.  
  - Rate limiting, anomaly detection, and DLP for transaction data.

- **Compliance** (assumptions):  
  - KYC/AML obligations may exist for certain transaction classes; integrated via external providers and policy‑as‑code.  
  - Jurisdiction‑specific tax and reporting requirements; handled via `services/compliance-reporter/`.

- **Constitutional constraints**:  
  - PoV and AZR rewards must be transparent, explainable, and auditable.  
  - AI systems suggesting financial actions (e.g., payouts, reward formulas) must be constrained by Ethics Monitor and governance.

---

## 6. PoV & Economic Flows

Mint & Pay is the **executor** of PoV decisions:

1. Domain services (Sapiens, Library, Marketplace, Research Center) emit contribution events.  
2. `services/pov-processor/` scores and classifies them (considering Abuse/Fraud rules).  
3. Approved PoV events issue reward instructions to Mint & Pay, which:  
   - Creates `TokenTransaction` records and adjusts `TokenBalance`.  
   - Optionally triggers on‑chain AZR minting/burning via On‑chain Bridge.  
   - Updates `Wallet` and `Transaction` entries if monetary component exists.

Flows must be deterministic and reversible (within governance rules) with full audit logs.

---

## 7. Bolt Register & Unknowns (Mint & Pay Specific)

- **P‑B1**: Exact regulatory classification of AZR and off‑chain tokens not finalized; legal input required.  
- **P‑B2**: On‑chain vs off‑chain balance reconciliation strategy not yet concretely specified (global Bolt B‑4).  
- **P‑B3**: Fraud and abuse detection features are conceptual; no implementation yet.  
- **P‑B4**: Tax and jurisdiction mapping per user/enterprise unknown; may be deferred in phases.  
- **P‑B5**: PoV and reward schedules must avoid perverse incentives (over‑optimization vs genuine value).

These are addressed in `MINT-PAY-TASKLIST.md` and master PAY‑* tasks.
