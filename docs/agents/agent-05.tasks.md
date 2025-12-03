# Agent 05 - API Gateway & Service Routing

Primary Focus: Harden `azora-api-gateway` routing & circuit breaker tests, validate all configured endpoints.

Priority: HIGH

Local Status: In Progress (started by agent-local) - Opened API Gateway tasks and prepared test & health aggregation plan.

Tasks:
1. Confirm service config entries in `services/azora-api-gateway/src/index.ts` and add missing services.
   - Acceptance: Document list of configured services vs actual local service directories.

2. Add unit & integration tests simulating an unhealthy downstream service and verify circuit breaker behavior.
   - Files: `services/azora-api-gateway/test/*`.
   - Acceptance: CI test demonstrates `503` for broken service and fallback behaviors when needed.

3. Implement a health aggregation endpoint that retries & caches health checks for all backend services.
   - Acceptance: `/health` returns a status for each service including latency metrics.

4. Build automated route testing that pings `GET /api/<service>/health` for every configured service and flags mismatches in CI.
   - Acceptance: CI step that fails if a configured endpoint returns non-2xx.

Verification steps:
- Run `npm test` for the gateway and ensure tests include the priority services.
- Run the health aggregator and check metrics.

