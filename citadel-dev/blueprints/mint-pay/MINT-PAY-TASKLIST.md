# Mint & Pay – Domain Implementation Task List

> Status: Draft v0.1 (deep dive)  
> Linked master task list: `citadel-dev/MASTER-IMPLEMENTATION-TASKLIST.md` (PAY-*, MP-2.*, LIB-7.1, SAP-3/4, CAI-*, DATA-*)

This list expands PAY-* tasks into concrete work items for wallets, ledgers, PoV, AZR bridge, and compliance.

---

## 1. Mint & Pay Core Ledger (Bolt B‑4)

- [ ] **PAY-1.0: Treasury & Fort Knox Monetary Policy Spec**  
  **Objective**: Define Azora's monetary policy, Fort Knox (treasury) operations, and their mapping to on‑chain AZR and the off‑chain ledger.  
  **Parent**: PAY-1.  
  **Dependencies**: `blockchain/AZRToken.sol`; UbuntuGovernance; PoV design docs; economic/legal input.  
  **Steps**:  
  - Specify minting sources (knowledge mining, contribution rewards, ecosystem grants) and burn sources (service usage, penalties, sinks) with clear formulas and caps.  
  - Define roles and controls for Treasury / Citadel operations (who can propose, approve, and execute changes).  
  - Map policy parameters to on‑chain controls and off‑chain configuration (e.g., Treasury contract parameters, PoV weightings).  
  - Document scenarios for supply expansion, contraction, and emergency circuit breakers.  
  **Acceptance criteria**:  
  - Monetary policy and Fort Knox operations are documented, internally reviewed, and versioned.  
  - Policy can be encoded as configuration and/or on‑chain parameters without ambiguity.  
  **Verification**:  
  - Economic and legal review; governance sign‑off; consistency checks against PoV and Marketplace flows.  
  **Artifacts**: Monetary policy spec, configuration templates, updated blueprint references.  
  **Ownership**: Mint + Governance squads (with Citadel oversight).  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `citadel-dev/blueprints/mint-pay/`, `blockchain/`, `docs/business/`.  

- [ ] **PAY-1.1: Ledger Service Skeleton & API**  
  **Objective**: Scaffold `services/mint-pay/` with APIs for wallets, balances, and transactions.  
  **Parent**: PAY-1.  
  **Dependencies**: Prisma `Wallet`, `Transaction`, `TokenBalance`, `TokenTransaction`; Auth Core.  
  **Steps**:  
  - Set up service skeleton with health checks and CI pipeline.  
  - Implement wallet creation and retrieval endpoints.  
  - Add transaction APIs for deposits, withdrawals, transfers, and payments, with idempotency keys.  
  **Acceptance criteria**:  
  - Users can have multiple wallets (per currency) with correct uniqueness constraints.  
  - Transactions update balances atomically; idempotent under retries.  
  **Verification**:  
  - Unit and integration tests for transaction flows; race condition tests.  
  **Artifacts**: Service code, API specs, runbooks.  
  **Ownership**: Mint squad.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/mint-pay/`, `prisma/schema.prisma`.

- [ ] **PAY-1.2: Ledger Integrity & Reconciliation Engine**  
  **Objective**: Implement periodic reconciliation between Mint & Pay ledger, PoV records, and (later) on‑chain AZR balances.  
  **Parent**: PAY-1, PAY-2.  
  **Dependencies**: PoV processor; On‑chain Bridge; AZRToken contract; `MiningActivity`.  
  **Steps**:  
  - Define reconciliation processes for off‑chain token balances vs TokenBalance/TokenTransaction.  
  - Implement jobs that detect and flag discrepancies; support manual corrections with audit logs.  
  - Extend to include on‑chain supply and addresses once bridge is live.  
  **Acceptance criteria**:  
  - Reconciliation jobs run on schedule and produce actionable reports.  
  - Discrepancies above thresholds raise alerts.  
  **Verification**:  
  - Tests with synthetic mismatches; manual audit flow.  
  **Artifacts**: Reconciliation jobs, dashboards, runbooks.  
  **Ownership**: Mint + Governance squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/mint-pay/`, `services/pov-processor/`, `blockchain/`.

---

## 2. PoV & Reward Processing

- [ ] **PAY-2.1: Reward Instruction Contract (PoV → Mint & Pay)**  
  **Objective**: Define a stable contract for PoV processor to request rewards from Mint & Pay.  
  **Parent**: PAY-2, LIB-7.1, SAP-4.1, MP-1/2.  
  **Dependencies**: PoV event taxonomy; TokenTransaction schema.  
  **Steps**:  
  - Specify `RewardInstruction` payload (user, amount, reason, source, policy version, optional on‑chain flag).  
  - Implement endpoint(s) in Mint & Pay to accept and validate instructions.  
  - Enforce per‑user and per‑policy limits relative to PoV rules.  
  **Acceptance criteria**:  
  - PoV processor can safely request rewards; invalid or suspicious requests are rejected or queued for review.  
  - Reward flows are fully traceable from event to TokenTransaction.  
  **Verification**:  
  - Unit/integration tests; simulated high‑volume reward events.  
  **Artifacts**: Contracts, API docs, PoV integration docs.  
  **Ownership**: Mint + PoV squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/mint-pay/`, `services/pov-processor/`.

- [ ] **PAY-2.2: Reward Policy Enforcement & Anti‑Abuse**  
  **Objective**: Enforce reward policies (daily caps, category weights, anti‑gaming rules) via policy‑as‑code.  
  **Parent**: PAY-2, CAI-2.  
  **Dependencies**: Policy engine; Governance decisions; PoV processor.  
  **Steps**:  
  - Implement policy evaluation for reward instructions (frequency, source diversity, correlation with real activity).  
  - Add anomaly detection for potential gaming (e.g., circular evaluations, spam tasks).  
  - Integrate with Ethics Monitor and Reputation service for triage.  
  **Acceptance criteria**:  
  - Gaming attempts are detected and mitigated; false positive rate kept acceptable.  
  - Policy changes are logged and testable.  
  **Verification**:  
  - Simulated attack scenarios; governance reviews.  
  **Artifacts**: Policy files, tests, dashboards.  
  **Ownership**: Mint + Constitutional AI + Governance squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/mint-pay/`, `services/ai-ethics-monitor/`, `services/reputation/`.

---

## 3. On‑Chain Bridge (AZRToken)

- [ ] **PAY-3.1: On‑Chain Bridge Service & Key Management**  
  **Objective**: Implement `services/onchain-bridge/` to manage AZR mint/burn and sync with off‑chain ledger.  
  **Dependencies**: `blockchain/AZRToken.sol`; KMS/Vault; reconciliation engine.  
  **Steps**:  
  - Define bridge operations (mint, burn, transfer, query balances).  
  - Integrate with HSM/KMS for key management.  
  - Expose internal gRPC/REST endpoints that Mint & Pay and Treasury can call.  
  **Acceptance criteria**:  
  - No direct signing from app code; all chain interactions go via Bridge with audit logs.  
  - On‑chain and off‑chain total supply stay within acceptable variance.  
  **Verification**:  
  - Testnet integration tests; reconciliation tests.  
  **Artifacts**: Bridge service, key management docs, runbooks.  
  **Ownership**: Mint + Infra/Security squads.  
  **Effort**: L  
  **Priority**: P1  
  **Repo paths**: `services/onchain-bridge/`, `blockchain/AZRToken.sol`, `infrastructure/`.

---

## 4. Integrations – Marketplace, Sapiens, Library, Research Center

- [ ] **PAY-4.1: Marketplace & Escrow Integration**  
  **Objective**: Wire Marketplace escrow flows to Mint & Pay for funding, holding, and releasing payments.  
  **Parent**: PAY-1, MP-2.1.  
  **Dependencies**: Marketplace Core; Escrow Service; Mint & Pay ledger.  
  **Steps**:  
  - Define event and API contracts between Escrow and Mint & Pay.  
  - Ensure each Contract/Milestone has corresponding ledger operations.  
  - Add reconciliation tests per contract lifecycle.  
  **Acceptance criteria**:  
  - Every escrow state change reflects in ledger and vice versa.  
  - No payouts without valid escrow resolution.  
  **Verification**:  
  - E2E marketplace payment tests; reconciliation checks.  
  **Artifacts**: Integration docs, tests, dashboards.  
  **Ownership**: Mint + Marketplace squads.  
  **Effort**: M  
  **Priority**: P1  
  **Repo paths**: `services/mint-pay/`, `services/escrow-dispute/`, `services/marketplace-core/`.

- [ ] **PAY-4.2: Sapiens & Library Reward Integration**  
  **Objective**: Ensure Sapiens and Library contribution flows correctly emit PoV rewards and ledger updates.  
  **Parent**: PAY-2, SAP-4.1, LIB-7.1.  
  **Dependencies**: PoV processor; Sapiens & Library events.  
  **Steps**:  
  - Confirm event schemas and PoV mapping for key educational and library contributions.  
  - Implement e2e tests from event → PoV → Mint & Pay → ledger.  
  - Provide contributor views for earned tokens and history.  
  **Acceptance criteria**:  
  - Contributors see consistent balances and history for major contribution types.  
  - No double‑rewards for same event; PoV uniqueness guaranteed.  
  **Verification**:  
  - Test scenarios across Sapiens/Library; negative tests for duplicate events.  
  **Artifacts**: Integration specs, tests, UI mocks.  
  **Ownership**: Mint + Sapiens + Library squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `services/mint-pay/`, `services/pov-processor/`, `services/library-core/`, `services/sapiens-tutor/`.

---

## 5. Compliance & Reporting

- [ ] **PAY-5.1: Compliance Reporter MVP**  
  **Objective**: Implement `services/compliance-reporter/` for financial, PoV, and AZR reporting.  
  **Dependencies**: Mint & Pay ledger; PoV records; subscription and enterprise data.  
  **Steps**:  
  - Define report schemas (internal dashboards, regulator‑facing exports, tax summaries).  
  - Implement data extraction and anonymization/aggregation as needed.  
  - Build API and scheduled generation of key reports.  
  **Acceptance criteria**:  
  - Core reports (e.g., daily transaction summary, PoV distribution, large transfers) available.  
  - Sensitive fields handled according to policy‑as‑code.  
  **Verification**:  
  - Test reports with sample data; privacy checks.  
  **Artifacts**: Reporter service, report templates, docs.  
  **Ownership**: Mint + Governance + Data squads.  
  **Effort**: L  
  **Priority**: P2  
  **Repo paths**: `services/compliance-reporter/`, `services/mint-pay/`, `services/pov-processor/`.

---

## 6. Observability & Risk

- [ ] **PAY-6.1: Financial Observability & Risk Dashboards**  
  **Objective**: Provide visibility into transaction volumes, anomalies, and risk metrics.  
  **Dependencies**: OBS-1, OBS-2; Mint & Pay metrics; policy engine.  
  **Steps**:  
  - Instrument key Mint & Pay operations with Otel metrics and traces.  
  - Build dashboards for transaction volume, failure rates, large transfers, and reconciliation errors.  
  - Add alerts for suspicious patterns and policy violations.  
  **Acceptance criteria**:  
  - Risk and treasury teams can quickly identify issues and anomalies.  
  - Reconciliation and fraud alerts fire reliably.  
  **Verification**:  
  - Simulated anomalies; incident runbooks executed in drills.  
  **Artifacts**: Dashboards, alerts, runbooks.  
  **Ownership**: Mint + SRE + Security squads.  
  **Effort**: M  
  **Priority**: P2  
  **Repo paths**: `monitoring/`, `services/mint-pay/`.

---

## 7. Activation Roadmap – Mint & Pay

- **Phase 1**: Core ledger & wallets – PAY-1.1, PAY-1.2.  
- **Phase 2**: PoV integration – PAY-2.1, PAY-2.2 and PoV processor baseline.  
- **Phase 3**: On‑chain bridge – PAY-3.1 and reconciliation with AZRToken.  
- **Phase 4**: Marketplace, Sapiens, Library integration – PAY-4.1, PAY-4.2.  
- **Phase 5**: Compliance & risk – PAY-5.1, PAY-6.1, CAI/SEC policies for financial data.
