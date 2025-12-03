# Agent 04 - Constitutional AI & AI Ethics Monitor

Primary Focus: Upgrade the `constitutional-ai` service to a real reasoning model with self-critique, bias detection, and audit logs.

Priority: CRITICAL

Local Status: In Progress (started by agent-local) - Opened constitutional-ai tasks and prepared initial local plan; will add bias modules and audits.

Tasks:
1. Review `services/constitutional-ai` and `services/ai-ethics-monitor` for current mock implementations.
   - Acceptance: Document all areas where random functions or keyword filters are used.

2. Implement bias detection: add a standardized function and integration with detection models or heuristics.
   - Files: `services/constitutional-ai/src/bias.ts` (new) and `services/ai-ethics-monitor/src/analysis.ts`.
   - Acceptance: Unit tests that detect three different simulated bias cases.

3. Implement self-critique loop for AI responses.
   - Work: Allow the AI to evaluate and critique its response, store the critique in DB for audit.
   - Acceptance: API returns AI response + critique object; audit logs show critique recorded.

4. Add audit logs and `constitutional_audit` schema entries and API for fetching audits.
   - Files: `prisma` schema migration + `services/constitutional-ai/src/audit-controller.ts`.
   - Acceptance: Audits retrievable via `/api/constitutional-ai/audit/:id`.

Verification steps:
- Unit tests for bias detection and critique logic.
- Integration test that ensures a message processed by Constitutional AI generates an audit record.

Env / setup:
- LLM provider API key (OpenAI/Anthropic) `OPENAI_API_KEY`, or use local mock for tests.
