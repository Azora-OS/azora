# Elara Orchestrator (minimal scaffold)

This is a small scaffolding for a local orchestrator used by BuildSpaces. It exposes a simple HTTP `/invoke` endpoint that accepts agent invocation payloads and returns a mocked response. If a Prisma client is available, it will persist `AgentExecution` records.

Quick start:

```bash
cd services/elara-orchestrator
npm install
npm start
```

Environment variables:

- `PORT` — port to listen on (default `4000`)

To enable persistence, ensure `@prisma/client` is installed and `prisma generate` has been run in the workspace.
