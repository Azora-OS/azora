# Constitutional Gate Implementation — Design & Tasks

Objective
- Implement constitutional gates across CI, orchestrator, ingestion, and PR checks to enforce No Mock Protocol, truth scoring, and verification of stateful actions.

Key areas to implement:
1. Orchestrator gating (services/ai-orchestrator) — When an agent attempts to make a stateful mutation, require a call to `services/constitutional-ai` and a verification proof.
2. CI gating — GitHub Action `ci/constitutional-check` that verifies policies & agent outputs for PRs that change policy, agent code, or ingestion.
3. Ingestion gating — For `services/azora-library` and `services/azora-sapiens` ingestion scripts, call the verifier on data tagged with risk indicators.

Implementation Tasks:
- Create API for verification in `services/constitutional-ai`.
- Add a client library (`packages/shared-constitutional`) for other services to call the verifier easily.
- Implement the `ci/constitutional-check` workflow that invokes a dry-run verifier on changes in PR.
- Add an SDK to `packages/shared-ai` to provide `BaseAgent.validate` hooks that call `services/constitutional-ai`.

Acceptance Criteria:
- No PR touching `packages/shared-ai/` or `services/*` agent code or policy files can be merged without passing the constitutional gate.
- The Orchestrator must not commit any persistent change without a verification proof recorded in the audit log.

Verification:
- Integration tests for the gate and a simulation harness for verifying a range of agent outputs.
- Red-team tests that attempt to bypass gate will be run for coverage.

Artifacts:
- `services/constitutional-ai/`
- `packages/shared-constitutional/`
- `.github/workflows/ci-constitutional-check.yml` (new)
- `packages/shared-ai/`.
