# C4 - Constitutional AI Core (Truth, No Mock, Audit)

## System View
- Purpose: Ensure agent behavior, training data, and platform actions meet constitutional constraints (No Mock, Truth over Comfort). Provide verifiable controls, cryptographic proof, and a governance pipeline.

## Containers
- `services/constitutional-ai/` — Main verification engine: policies, truth-scoring, provenance checking.
- Policy Store — manifests (`CONSTITUTION.md` + policy variants), versioned.
- Court Interface — a service to handle dispute resolution and human-in-the-loop judgments.
- Audit Store — append-only tamper-evident log (immutable storage with signed hashes).

## Components
- Rule Engine
  - Validates `agent outputs` against rules (`No Mock`, `truthScore` thresholds).
- Verifier
  - Verifies signatures & provenance for data and agent actions.
- Scoring
  - Computes alignment and truth metrics and returns a `verdict` used by orchestrator.
- Governance Hooks
  - Exposes REST/gRPC to Orchestrator, PR CI, and Data ingestion pipelines.

## Data Model
- VerificationRequest {requestId, subject, agentRunId, policyId, data, evidence, timestamp}
- VerificationResult {verdict, score, evidence, signatures}
- SignedEvent {eventId, payload, signature}

## Integrations
- Orchestrator: for gating stateful actions.
- Ingestion: for pre-training DLP & license checks.
- CI: for PR gating on agent policies & critical changes.

## Observability
- Metrics:
  - verification_requests_total, verification_denied_total, time_to_verify_seconds

## Acceptance Criteria
- 100% of stateful agent actions produce a verification result before commit.
- PRs affecting agent logic must pass a verification check in CI.

## Next Steps
- Create a policy authoring UI for the legal & product teams to author constitutional policies.
- Add sample policies and test suite that asserts ``No Mock`` rules and truth thresholds.
