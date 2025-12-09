# C4 - AzStudio (Elara Orchestration) — Detailed

## System View (AzStudio)
- Purpose: Provide a unified, safe, and auditable agent lifecycle orchestration to enable autonomy in Azora’s ecosystem.
- Key responsibilities:
  - Create, schedule, and run agents.
  - External & internal skill execution.
  - Enforce constitutional checks.
  - Provide observability & telemetry for agent runs.

External Services:
- Model Providers (OpenAI, Azure OpenAI, Local LLMs)
- Knowledge Ocean for retrieval
- Monitoring (Prometheus/Grafana) & log storage

## Container View
- elara-master-launcher (genome/elara-master-launcher.ts)
  - Launches local development services for Elara.
- services/ai-orchestrator/
  - Orchestrator service (API for lifecycle management).
  - Exposes `POST /orchestrator/execute`, `POST /orchestrator/manage`.
- services/agent-execution/
  - Agent run-time executor; sandboxed container environment.
  - Manages ephemeral compute resources, secrets, ephemeral credentials.
- services/skills-registry (packages/shared-ai / services/ai-orchestrator)
  - Stores skill manifests and versioning.
- services/constitutional-ai/
  - Performs the Constitutional verification.
- Event Bus (Kafka/Redis Streams/Temporal)
  - Durable events and scheduling functionality.

## Component View (orchestrator)
- Lifecycle Manager
  - Implements states: scheduled → running → validated → success/fail.
  - Hooks to audit logs & verification.
- Scheduler
  - Implements scaling strategies, priority and back-pressure.
- Verification Gate
  - Calls `services/constitutional-ai` to validate agent outputs before stateful operations.
- Secrets Manager
  - Injects ephemeral secrets from KMS (AWS KMS, GCP KMS) into runtime with strict TTL.
- Observability Hooks
  - Logs (structured), traces (OpenTelemetry), metrics (Prometheus), artifacts capture.

## Data Model
- Actor: Agent owner (developer/skill owner)
- AgentRun: {id, agentId, state, createdAt, startedAt, finishedAt, input, outputs, verificationProof}
- Skill Manifest: {skillId, version, contract, inputSchema, outputSchema, policies}

## Security Considerations
- Each runtime is sandboxed and requests least-privilege credentials.
- All agent actions touching persistent data require verification proof.
- Default deny policy for stateful operations unless verified by Constitutional AI.

## Observability & SRE
- Ensure each agent run emits trace (span per action) and metrics:
  - agent_runs_total, agent_runs_success, agent_runs_fail, agent_run_latency_seconds
- Add alerts for high failure rates or verification denials.

## Implementation notes & repo cross references
- Starter: `genome/elara-master-launcher.ts` orchestrates local dev services.
- Orchestrator: `services/ai-orchestrator/`.
- Agent invoker: `services/agent-execution/` (sandboxed runtime).
- Skills registry and BaseAgent lifecycle: `packages/shared-ai/`.
- Constitutional verification: `services/constitutional-ai/`.

## Acceptance Criteria
- Orchestrator must provide RBAC-enabled APIs and abide by constitutional checks for all stateful actions.
- All runs produce an audit trail and must be traceable.

## Next Steps
- Soft-launch with synthetic agent runs in staging.
- Expand skill registry with sample skills and policy contracts.
- Add a full runbook for incident handling in `SRE` folder.
