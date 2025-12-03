# Agent 03 - CitadelFund & Treasury

Primary Focus: Ensure CitadelFund collects 10% of revenue, stores transparency records, and is audited.

Priority: CRITICAL

Local Status: In Progress (started by agent-local) - Identified in-memory governance proposals in `citadel-service.ts` and drafted a migration plan to move proposals to Prisma database. See local-progress/agent-03/progress.json for details.

Tasks:
1. Review `services/citadel-fund` and `citadel-repository.ts` to identify TODOs or in-memory state (governance cache).
   - Acceptance: Identify where data is kept in memory and produce a migration plan to DB.

2. Move governance proposals from in-memory to Prisma database.
   - Files: `services/citadel-fund/src/citadel-repository.ts`, `prisma/schema.prisma`.
   - Acceptance: PR that adds tables, runs migrations, and tests reading/writing proposals.

3. Verify the 10% collection flow from billing to CitadelFund and record the revenue event on the blockchain.
   - Work: Create integration tests that simulate a payment (Stripe or mock) and require 10% to be collected and stored in CitadelFund DB.
   - Acceptance: End-to-end test shows balances and allocations update accordingly.

4. Add `getTransparencyReport` API that returns audit-ready CSV/JSON data with allocations, receipts, and blockchain transaction hashes.
   - Acceptance: The result can be used for an audit with a single API call.

Verification steps:
- Use local DB for migration plan and test data; run `npx prisma migrate dev` locally in a dev DB.
- Run service tests: `cd services/citadel-fund; npm ci; npm test`.

Env / setup:
- DB env vars (`DATABASE_URL`) and `BLOCKCHAIN_PRIVATE_KEY`.
