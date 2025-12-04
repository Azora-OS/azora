# Azora — Copilot / AI Agent Instructions (short)

Purpose: Quick repo-specific guidance so AI coding agents (Copilot, CLI bots, or internal agents) can contribute safely and productively.

1) Quick Setup & Life Cycle
- Monorepo: Turborepo + npm workspaces. Node >= 20. Use `npm ci` then `npm run dev` for full local dev.
- Build: `npm run build`. Tests: `npm test` or `npm test -- services/ai-routing` to target a package.

2) Key Components (start here)
- `packages/shared-api/ai-router.ts` — Multi-Model router, provider endpoints, and `AGENT_PROMPTS` (system prompts/personality definitions).
- `packages/shared-ai/` — `BaseAgent` lifecycle: `recognizePatterns -> reason -> validate -> act`.
- `services/agent-execution` — Local agent runtime (in-memory default; enable `DATABASE_URL` for Prisma persistence).
- `services/knowledge-ocean` — Vector search & indexing (in-memory/pgvector/Pinecone adapters).
- `services/azora-cloud/ai-routing`, `services/ai-routing` — routing tiers: LOCAL_LLM, RAP_SYSTEM (Knowledge Ocean), EXTERNAL_LLM.
- `packages/azorahub/copilot-cli` — Local CLI & dashboard for quick integration testing.

3) Important Conventions & Env Flags
- Use `AGENT_PROMPTS` and `DEFAULT_MODELS` in `ai-router.ts` when changing agent behavior or adding providers.
- Feature flags → env: `DATABASE_URL`, `SANDBOX_ENABLED`, `USE_REDIS`/`REDIS_URL`, `LOCAL_LLM_MODEL`, `EXTERNAL_LLM_PROVIDER`.
- Keep in-memory fallbacks intact: they enable development without infrastructure.

4) DB & Prisma
- `prisma/` contains unified schema and migrations. Typical workflow: `npm run db:generate` → `npm run db:migrate` → `npm run db:seed`.
- Package-local db scripts may exist (e.g., `services/elara-incubator`). Search for `db:migrate` if unsure.

5) Tests & Observability
- Add unit tests to `tests/unit`, integration tests to `tests/integration`, and E2E to `tests/e2e`.
- Routing metrics are tracked in `ai-routing` (see `RoutingMetricsTracker`). Use Redis for caching & event bus; tests show Redis pipeline usage.

6) Safety, Ethics & Cost
- Constitutional validation: any action that changes persisted state must be validated in `packages/shared-ai` (see `BaseAgent.validate` and `DIVINE_LAW_PRINCIPLES`).
- Avoid exposing API keys in PRs; use `.env` or CI secrets. For cost-sensitive code paths (external LLMs), add cost thresholds and tests.

7) Where to Extend
- Add an AI provider: modify `ai-router.ts` to add endpoints, models, and tests.
- Add a new agent: extend `packages/shared-ai`, add personality in `AGENT_PROMPTS`, wire into `services/agent-execution`.
- Copilot Integration: `services/copilot-integration` contains a stub; to implement real auth, proxy requests and map to `vscode.commands.executeCommand`.

Reference files: `packages/shared-api/ai-router.ts`, `packages/shared-ai/base-agent.ts`, `services/agent-execution/README.md`, `services/azora-cloud/ai-routing/README.md`, `prisma/README.md`, `packages/azorahub/copilot-cli/README.md`.

If anything here is unclear, tell me what you'd like expanded (short examples or inline edits) and I’ll iterate.