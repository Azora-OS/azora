# Agent 01 - Blockchain Service Integration (Phase 1)

Primary Focus: Implementing a production-grade `azora-blockchain` service with real contract interaction, event listeners, and improved transaction handling.

Priority: CRITICAL

Local Status: In Progress (started by agent-local) - Did initial review, attempted to run tests; encountered monorepo workspace conflicts when running `npm ci` within service folder. See local-progress/agent-01/progress.json for details.

Tasks:
1. Understand the current `services/azora-blockchain` implementation and the `BlockchainService` singleton.
   - Work: Read `src/blockchain-service.ts` and `src/server.ts`.
   - Local run: `cd services/azora-blockchain; npm ci; npm run dev`.
   - Acceptance: Confirm `GET /health` and `GET /api/block-number` work against a local Hardhat/ganache instance.

2. Add configurable network support and add `NetworkConfig` profiles for mainnet/testnet/local.
   - Files: `services/azora-blockchain/src/config.ts` (new file), update `blockchain-service.ts` to accept config.
   - Acceptance: Service able to switch RPCs via ENV: `BLOCKCHAIN_RPC_URL`.

3. Improve transaction queue and retry logic.
   - Work: Implement an in-memory transaction queue with persisted retry metadata (could be a DB table or file log), and retry failed transactions with exponential backoff.
   - Files: `services/azora-blockchain/src/transaction-queue.ts` (new file).
   - Acceptance: Unit tests for queue, and CI test that simulates failed tx, verifies retry & eventual success.

4. Event listeners + contract verification.
   - Work: Confirm event subscriptions for `AZR` and `NFTCertificate` ERC events and write an event handler that writes `blockchain_event_logs` into DB (prisma schema migration required).
   - Files: `services/azora-blockchain/src/event-listeners.ts`, `prisma/schema.prisma` migration.
   - Acceptance: Push a test event in a local Hardhat network and ensure the event is consumed and logged.

5. Add gas optimization & protection for rate-limited contract calls.
   - Work: Implement gas estimates & gas-price fallback logic.
   - Acceptance: Unit tests for fallback values and immediate fail/retry when gas is insufficient.

Verification steps:
- Local Hardhat/Anvil: Start a local chain.
- Run tests: `npm test` in `azora-blockchain` and include integration tests with a local hardhat node.

Notes & env variables:
- Required: `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, `AZR_CONTRACT_ADDRESS`, `NFT_CERTIFICATE_CONTRACT_ADDRESS`.
- If you need DB access for event logging, coordinate with Agent 8 (Database) or create a local SQLite instance as a dev path.

