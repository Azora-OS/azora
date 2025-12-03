# Agent Execution Service - Changelog

## 0.1.1 - Initial Prisma persistence, execution modeling and lifecycle wiring

- Added Prisma schema with models: Agent, Task, Execution, KnowledgeNode
- Added Prisma scripts to package.json for generate & migrate
- Implemented create/update/get for Execution records in `repo.ts`
- Wired Execution creation and update in `runtime.ts` (DB guarded)
- Updated runtime lifecycle ops (cancel/pause/resume) to update Execution records
- Added endpoints: `GET /execution/:id` and `GET /task/:id/executions`
- Added unit tests for lifecycle operations and execution persistence guarded by DB presence
- Updated README with Prisma instructions and TASKS-AGENT-ARCHITECTURE.md to note task progress
