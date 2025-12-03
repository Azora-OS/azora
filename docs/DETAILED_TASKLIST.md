# 📋 Detailed Remediation Task List

**Objective**: Transform Azora from a high-fidelity prototype into a production-ready operating system.
**Focus**: Persistence, Security, Real Integration.

---

## 🏗️ Phase 1: Foundation & Persistence

### 1.1 Database Layer Hardening
- [ ] **Create Centralized Prisma Schema**: Consolidate data models for CitadelFund, ProofOfValue, and other "mock" services into the main `schema.prisma`.
- [ ] **Implement Database Service**: Replace `azora-database-layer.ts` (if it's a mock) with a real singleton connection pool manager.
- [ ] **Migration Strategy**: Create a script to run migrations across all services (or centralized DB).

### 1.2 Authentication & Security
- [ ] **Implement JWT Verification Middleware**: Create a shared library `packages/auth-middleware` that verifies tokens.
- [ ] **Apply Auth Middleware**: Add this middleware to `azora-api-gateway` to protect all downstream services.
- [ ] **Secure Service-to-Service Communication**: Implement mTLS or a shared "Service Secret" header so services only accept requests from the Gateway.

---

## 🔗 Phase 2: Blockchain Integration

### 2.1 Robust Blockchain Service
- [ ] **Add Fallback Logic**: Modify `BlockchainService` to check if contracts exist before calling them. If not, return a clear "Service Unavailable" error or use a read-only fallback.
- [ ] **Environment Validation**: Create a startup check that validates `RPC_URL` and `PRIVATE_KEY` are set and working.
- [ ] **Contract Deployment Pipeline**: Create a script `deploy-contracts.sh` that deploys contracts to a local Hardhat node and updates `deployments.json` automatically.

### 2.2 Token Integration
- [ ] **Connect Mint Service**: Update `azora-mint` to call `BlockchainService` for real minting instead of just logging.
- [ ] **Sync Balances**: Create a background worker that listens for `Transfer` events on-chain and updates the SQL database "cached balance" for fast UI reads.

---

## 🏦 Phase 3: Financial Systems (CitadelFund)

### 3.1 CitadelFund Real Implementation
- [ ] **Remove In-Memory State**: Delete `let citadelState = ...` in `services/citadel-fund/server.js`.
- [ ] **Add Database Persistence**: Update endpoints to read/write to PostgreSQL (e.g., `CitadelTransaction`, `ScholarshipGrant` tables).
- [ ] **Connect to Blockchain**: When a grant is approved, trigger a real blockchain transaction via `BlockchainService`.
- [ ] **Idempotency**: Add idempotency keys to `collect` endpoints to prevent double-counting revenue.

### 3.2 Proof-of-Value Engine
- [ ] **Database Persistence**: Store "Value Scores" and "Proofs" in the database.
- [ ] **Verification Logic**: Implement actual logic to verify "Knowledge Proofs" (e.g., check git commit signature, verify content hash).
- [ ] **Reward Distribution**: Connect to `azora-mint` to actually mint AZR tokens when value is proven.

---

## 🧠 Phase 4: AI Systems (Constitutional AI)

### 4.1 Real AI Integration
- [ ] **Integrate LLM Provider**: Connect `constitutional-ai` service to OpenAI/Anthropic API (via `ai-orchestrator` or direct).
- [ ] **Replace Keyword Filters**: Replace `ConstitutionalFilter` class with prompt engineering that asks the LLM to evaluate content against the Ubuntu principles.
- [ ] **Implement Caching**: Cache LLM responses (Redis) to save costs on repeated checks.

### 4.2 AI Ethics Monitor
- [ ] **Real-time Monitoring**: Instead of `Math.random()`, have the monitor subscribe to the Event Bus to see actual AI decisions.
- [ ] **Alerting**: Trigger alerts (email/Slack) when "Constitutional Violation" score exceeds a threshold.

---

## 🚪 Phase 5: API Gateway & Infrastructure

### 5.1 Gateway Enhancements
- [ ] **Rate Limiting (Redis)**: Replace memory store with Redis for distributed rate limiting.
- [ ] **Request Logging**: Implement structured logging (JSON) for every request passing through the gateway (Trace ID, Latency, Status).
- [ ] **Circuit Breakers**: Add `opossum` or similar library to stop cascading failures if a downstream service is down.

### 5.2 Deployment Readiness
- [ ] **Docker Compose Production**: Verify `docker-compose.prod.yml` uses built images, not `npm run dev`.
- [ ] **Health Check Aggregator**: Create a `/health/global` endpoint in the gateway that pings all downstream services and reports a system-wide status.
- [ ] **Secret Management**: Replace `.env` files with a secure injection mechanism for production.

---

## 📱 Phase 6: Frontend Integration

### 6.1 Connect Shells to Reality
- [ ] **Azora Pay**: Update UI to fetch real balances from `azora-mint` / `azora-blockchain` APIs.
- [ ] **Azora Sapiens**: Ensure course completion triggers a real call to `Proof-of-Value` service.
- [ ] **Error Handling**: Add global error boundaries to handle "Service Unavailable" states gracefully (e.g., if Blockchain is down).
