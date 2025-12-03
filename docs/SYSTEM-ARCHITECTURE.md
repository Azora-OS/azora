# Azora Nation - System Architecture

**Version**: 2.0 (Constitutional & Antifragile)
**Status**: Architecture Definition
**Last Updated**: 2025-11-25

---

## 🏛️ Architectural Philosophy

The Azora ecosystem is designed as a **single, self-optimizing organism** governed by three core technical pillars:

1.  **Constitutional AI (CAI)**: The "Superego" - Ensures ethical alignment.
2.  **Antifragile Microservices**: The "Body" - Thrives under stress.
3.  **Auditable Mutation Ledger (AML)**: The "Memory" - Immutable record of evolution.

---

## 🏗️ Technical Pillars

### 1. Constitutional AI Layer (The Superego)
*Ensures every interaction aligns with the Azora Constitution.*

*   **Core Component**: `Elara Agent Logic` (AI Orchestrator)
*   **Mechanism**:
    *   **Input**: User prompt or system event.
    *   **Critique**: Elara evaluates the input against the `Constitution.ts` ruleset (Privacy, Transparency, Fairness).
    *   **Action**: If compliant, execute. If violation, reject with explanation.
*   **Implementation**:
    *   `services/ai-orchestrator`: Central AI gateway.
    *   `packages/shared-api/constitution`: Shared constitutional definitions.
    *   **Mandate**: No direct LLM access. All calls must pass through the Orchestrator.

### 2. Antifragile Infrastructure (The Body)
*Designed to survive and improve from failures.*

*   **Core Pattern**: **Barbell Strategy** (Stable Core + Volatile Edge)
*   **Mechanism**:
    *   **Stable Core**: `Azora Master`, `Auth Service`, `Ledger`. Monolithic reliability.
    *   **Volatile Edge**: `AzStudio` generated apps, `Sapiens` plugins. Microservices that can fail without bringing down the core.
*   **Implementation**:
    *   **Microservices**: All apps communicate via REST/gRPC APIs.
    *   **Chaos Engineering**: `Azora Cloud` randomly terminates non-critical instances in staging to test resilience.
    *   **Low-Bandwidth Adapters**: `Sapiens` includes offline-first logic (PWA + LocalStorage) for network volatility.

### 3. Auditable Mutation Ledger (The Memory)
*Immutable record of every significant change.*

*   **Core Component**: `Azora Ledger` (Blockchain)
*   **Mechanism**:
    *   **Hashing**: Critical events (code deploys, compliance changes, large transfers) are hashed.
    *   **Recording**: Hash + Metadata written to the Ledger.
    *   **Verification**: System state can be replayed/verified from the Ledger.
*   **Implementation**:
    *   `services/azora-ledger`: Blockchain interface.
    *   `services/azora-compliance`: Auto-generates reports from Ledger data.
    *   **Mandate**: `transferWithAttribution` required for all coin movements.

---

## 🧩 System Components

### A. Education Suite (Sapiens, Studio, Classroom, Library)
*   **Frontend**: Next.js, React 19, Tailwind CSS.
*   **Backend**: Node.js, Express, PostgreSQL.
*   **Key Integration**:
    *   **Sapiens** \leftrightarrow **Mint**: Learning progress triggers `mint_reward` events.
    *   **Studio** \leftrightarrow **Orchestrator**: Content generation requests pass through Constitutional Critique.

### B. Business Suite (Enterprise, Jobspaces, Incubator)
*   **Frontend**: Next.js, Dashboard UI.
*   **Backend**: Microservices for HR, Project Management, Analytics.
*   **Key Integration**:
    *   **Enterprise** \leftrightarrow **Ledger**: Compliance logs written to AML.
    *   **Jobspaces** \leftrightarrow **Pay**: Payments require `attribution` metadata.

### C. Finance Suite (Pay, Finance, Mint)
*   **Core**: Dual-Token Economy ($LEARN, $AZR).
*   **Backend**: `azora-mint` (Token Logic), `azora-pay` (Gateway).
*   **Key Integration**:
    *   **Mint** \leftrightarrow **Ledger**: Enforces 1M/Country cap and PoV mining formula.
    *   **Pay** \leftrightarrow **Identity**: Hashes DID for privacy before burning tokens.

### D. Platform Suite (Master, Azrome, Cloud)
*   **Core**: System Administration & Infrastructure.
*   **Key Integration**:
    *   **Master** \leftrightarrow **Cloud**: Triggers chaos tests and auto-scaling.
    *   **Azrome**: Browser extension/app with built-in DID wallet and AI guardrails.

---

## 🔄 Data Flow: The Mutation Loop

1.  **User Action**: Student completes a project in `Buildspaces`.
2.  **Constitutional Check**: `Elara` verifies the project is original and safe.
3.  **Value Attribution**: `Mint` calculates PoV score based on complexity/impact.
4.  **Reward**: `Mint` issues $AZR tokens to Student's Wallet.
5.  **Mutation Record**: Transaction and Project Hash recorded in `Ledger`.
6.  **System Evolution**: `Oracle` analyzes successful projects to update `Sapiens` curriculum (Curriculum Mutation).

---

## 📊 Implementation Status (Snapshot)

*See `PRODUCT-SUITE.md` for detailed app status.*

*   **Core Services**: `Auth`, `Mint`, `Education` - **Running**.
*   **AI Layer**: `Orchestrator`, `Family` - **Scaffolded/Mocked**.
*   **Frontend**: `Sapiens`, `Buildspaces`, `Master` - **High Fidelity UI**.
*   **Infrastructure**: Local Dev Environment (Docker ready).

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14+, React 18/19, Tailwind CSS, Framer Motion.
*   **Backend**: Node.js, Express, Prisma, PostgreSQL, Redis.
*   **AI**: OpenAI/Anthropic APIs (via Orchestrator), Local LLMs (planned).
*   **Blockchain**: Custom Ledger (PostgreSQL-based MVP \rightarrow L2 Solution).
*   **DevOps**: Docker, Vercel/Railway, GitHub Actions.

---

**Architected for Antifragility.**
*The system gets stronger with every stressor.*
