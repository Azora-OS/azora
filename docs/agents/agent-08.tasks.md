# Agent 08 - Database Layer & Migrations

Primary Focus: Migrate in-memory state to DB (Prisma), add migrations, and optimize indexes and read replicas.

Priority: HIGH

Tasks:
1. Review current Prisma schema and find unimplemented `citadel` / `governance` tables.
   - Acceptance: Document missing tables and provide schema changes for a migration.

2. Add event logging table(s) for blockchain events and AI audits.
   - Files: `prisma/schema.prisma`, `prisma/migrations/*`.
   - Acceptance: Migration successfully adds the table to a local DB.

3. Add indices for frequently queried endpoints (e.g., `transactions`, `allocations`, `token_balances`).
   - Acceptance: Confirm index performance with a local query time improvement.

4. Add DB seeding script for local testing (seed 10 users, 5 courses, sample wallets).
   - Acceptance: `node scripts/seed-database.js` seeds the dev DB and tests run against it.

Verification steps:
- Run Prisma migration & seeds in local dev DB; run `npm test` for services relying on DB.

