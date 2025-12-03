# Agent Execution Service

Minimal skeleton service for agent execution. Provides an HTTP API to submit tasks and check status.  The runtime currently uses in-memory persistence for rapid development and demonstration. Replace with Prisma-backed storage for production.

Endpoints:
- POST /execute -> accepts { payload, agentId? }
- GET /task/:id -> returns task status

Run:
```
cd services/agent-execution
npm install
npm run dev
```

Configuration:
- Use in-memory task store by default.
- To enable Prisma DB persistence: set env var `DATABASE_URL` and run Prisma migrations.
- To enable sandboxed JS execution: set `SANDBOX_ENABLED=true`.
- To enable Redis event bus: set `USE_REDIS=true` and `REDIS_URL`.

