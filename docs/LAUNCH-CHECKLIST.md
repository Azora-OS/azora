<!--
  LAUNCH-CHECKLIST - Single view of everything required to be launch-ready
  Created: December 3, 2025
-->

# Azora Launch Checklist

This document aggregates all requirements to consider Azora ready for production launch. It is the canonical pre-flight checklist to be used by engineering, security, QA, and operations.

---

## Executive Summary

Complete the full list below and verify all acceptance criteria to consider the platform launch-ready. Agents 1, 2, and 3 have started their scope as of this writing (Blockchain, Mint, CitadelFund). Use the `docs/agents/` files for more granular tasks.

Minimal Launch Criteria (All must be met):
- End-to-end payment & wallet flow validated and reconciled (Stripe & blockchain integration)
- CitadelFund 10% allocation and transparent records (DB + on-chain adits)
- Security: OWASP & pen-test critical issues resolved, security tests in CI
- Observability: Jaeger/Prometheus/Grafana configured for core paths; alerting & runbooks in place
- Constitutional AI: fairness/bias and self-critique + audit logging
- Proof-of-Value integration with AZR mint and anti-gaming protection
- All critical services are deployed and healthy on staging, with successful E2E and load tests

---

## Priority Area Checklist

1) Payments & Wallet (High)
   - Owner: Agent 1, Agent 2, Agent 3 (priority)
   - Files/artefacts: `services/azora-pay/*`, `services/billing-service/*`, `services/azora-mint/*`, `services/azora-blockchain/*`
   - Must do:
      - Replace mock `processWalletFunding`/`processWalletWithdrawal` with a production-grade implementation and a retry/idempotency mechanism.
      - Implement Stripe full webhook handler and reconciliation job; ensure that all revenue flows collect 10% for CitadelFund.
      - Ensure blockchain transactions used for wallet/account logging are robust and gas-efficient.
   - Acceptance:
      - Integrated test using Stripe test keys ➜ successful webhook & DB reconciliation.
      - On-chain records exist and can be linked to transactions in DB.
   - Verification Steps:
      - Create a test account; buy with Stripe test key; verify the transaction in the DB and blockchain event logs.

2) CitadelFund (High)
   - Owner: Agent 3
   - Files: `services/citadel-fund/*`, `prisma/schema.prisma`
   - Must do:
      - Move governance from in-memory to DB (Prisma), add audit trail for every allocation.
      - Add API to get transparency report and to export CSV/JSON with allocations and on-chain hashes.
   - Acceptance:
      - Governance proposals persisted across restarts; votes are recorded; automated allocations post-approval are logged on the blockchain when applicable.
   - Verification Steps:
      - Create a proposal, vote, approve, and verify the allocation in the DB and an on-chain transfer or test log.

3) Constitutional AI (High)
   - Owner: Agent 4
   - Files: `services/constitutional-ai/*`, `services/ai-ethics-monitor/*`
   - Must do:
      - Replace keyword filters with substantive bias detection and fairness scoring.
      - Build self-critique loops and ensure audit logs for decisions.
      - Integrate logging for all decisions and provide an audit API
   - Acceptance:
      - AI decision + critique stored and retrievable and unit tests validating fair/bias detection.
   - Verification Steps:
      - Submit content that should fail a fairness or bias test and verify the rejection + the audit log entry.

4) Proof-of-Value + Minting (High)
   - Owner: Agent 6, Agent 2
   - Files: `services/proof-of-value/*`, `services/azora-mint/*`
   - Must do:
      - Anti-gaming heuristics to detect duplicate values or spamming.
      - Verify the integration with the mint service for AZR token rewards.
   - Acceptance:
      - Proof verification leads to a mint transaction in testnet and the minted token is verifiable.
   - Verification Steps:
      - Submit a valid proof, verify an azr mint, and check wallet balance & event logs.

5) API Gateway & Service Discovery (High)
   - Owner: Agent 5
   - Files: `services/azora-api-gateway/*` and env configurations
   - Must do:
      - Validate service routing; implement resilience and circuit breakers.
      - Health aggregation endpoint must return accurate status of services.
   - Acceptance:
      - CI tests for simulated downstream failures that prove fallback & circuit breaker behavior.
   - Verification Steps:
      - Trigger a downstream service failure and confirm the gateway returns a 503 and circuit breaker metrics are recorded.

6) Observability & Service Mesh (High)
   - Owner: Agent 9
   - Files: `infrastructure/service-mesh/*`, `services/*/observability` and `docker*/k8s/*`
   - Must do:
      - Implement mTLS with a service mesh, Jaeger tracing, and Prometheus metrics for critical services.
      - Hook alerts for error rates and high-latency endpoints.
   - Acceptance:
      - Distributed traces for a login → enroll → payment journey visible in Jaeger; alerts created for SLO breaches.
   - Verification Steps:
      - Produce traces and verify dashboard alerts; run simulated SLO breach and validate alerts & escalations.

7) Security & Penetration Tests (High)
   - Owner: Agent 10
   - Files: `tests/penetration/*`, `.github/workflows/security-tests.yml`
   - Must do:
      - Replace placeholder detection calls with real checks.
      - Run a penalty-level pen test and fix critical & high findings.
      - Integrate secrets scan & dependency scanning in the CI pipeline.
   - Acceptance:
      - No critical vulnerabilities; high issues resolved or mitigated and approved by the security team.
   - Verification Steps:
      - CI must fail on new criticals; run a full automated tool (OWASP, Snyk); run manual pen test summary.

8) Database Migration & Reliability (High)
   - Owner: Agent 8
   - Files: `prisma/`, `services/*/prisma` migration scripts
   - Must do:
      - Add missing indexes, add event & audit tables, migrate in-memory structures to DB.
      - Provide rollback strategies for migrations.
   - Acceptance:
      - Migrations applied in staging, tested, and can be rolled back in < 30min.
   - Verification Steps:
      - Run migrations in a staging cluster; perform data restore and rollback tests.

9) Frontend, Mobile, and E2E (Medium)
   - Owner: Agent 7
   - Files: `apps/*/`, `tests/e2e/*`, `playwright.config.ts`
   - Must do:
      - Finalize UI flows, E2E tests, CI builds for mobile and web app releases.
      - Accessibility and cross-browser checks.
   - Acceptance:
      - E2E runs in CI; mobile builds produce artifacts (IPA/APK) for staging distribution.
   - Verification Steps:
      - Run E2E, test mobile artifacts, and verify critical paths.

10) Infrastructure & Production Deploy (High)
    - Owner: DevOps lead (Agent 9 and team)
    - Files: `docker-compose.*`, `k8s`, `helm` charts
    - Must do:
       - Blue/Green or Canary deployment strategy with rollbacks, secrets management (Vault/AWS Secret Manager), and cluster autoscaling.
    - Acceptance:
       - Deployments validated in staging and rollback time < 15 minutes.
    - Verification Steps:
       - Run a pre-deployment smoke test and a staged release; verify rollback.

11) Legal, Compliance & Docs (High)
    - Owner: Product & Legal
    - Files: `docs/`, `LICENSE`, compliance docs under `docs/compliance` and `CONSENT` storage
    - Must do:
       - GDPR & privacy checks; consent management; Terms & Privacy updated.
       - Stakeholder sign-offs for SOC2 / GDPR or required regulatory compliance.
    - Acceptance:
       - Legal acceptance, signed SLAs, GDPR compliance proof.
    - Verification Steps:
       - Validate docs + signed approvals in repository tracking.

---

## Pre-Launch Verification Checklist (fast run)

- [ ] All critical services pass `npm run build` and `npm test` in CI.
- [ ] All E2E tests pass in staging for login, enroll, payment, minting, and proof-of-value flows.
- [ ] All CI checks (lint, unit tests, integration tests, security scans) pass green.
- [ ] Prometheus metrics, Jaeger traces, and Grafana dashboards are configured and capture a smoke sequence.
- [ ] Penetration testing shows no critical or high severity findings outstanding.
- [ ] DB migrations tested and reversible; backups configured and validated.
- [ ] Feature toggles set for new features; release toggles configured for staged rollout.
- [ ] Rollback plan validated; runbook for incident response ready.
- [ ] Legal & compliance sign-off captured in a document and available in `docs/COMPLIANCE`.

---

## Launch Day Runbook (T-24, T-1, T-0)

T-24 hours:
- Final test run and security scan, ensure alerting is green, all primary on-call members are briefed

T-1 hour:
- Final verification of health check, green CI pipeline, backups taken, and team on standby

T-0 (Deployment):
- Deploy using Blue/Green/Canary, verify new pods running, run smoke tests, monitor SLOs and set 10% traffic to new version

T+1 hour:
- Verify performance, server metrics, and production monitoring; stop rollback if stable.

T+24 hours:
- Full stability review and post-launch KPI reporting

---

## Post-Launch Check: 24–72 Hours

- Check errors and latency trends (P95/P99) and take action if thresholds crossed.
- Verify commerce flows and transactions in the ledger for expected revenue and 10% allocation.
- Confirm proofs minted and assets verified on blockchain.
- Confirm user flows and retention metrics.

---

## Notes & Assumptions

- This checklist assumes the 10 agent items are completed (or in-progress), and that agents 1, 2 and 3 have started and made progress.
- External audits and legal compliance stages can add significant time.
- If external providers (Stripe, blockchain providers, LLM providers) are needed, ensure test keys and quotas are secured for test runs.

---

## Appendix — Contact & Roles

-+- Engineering Team Leader: [assign]
- DevOps: [assign]
- Security Lead: [assign]
- Product / Compliance: [assign]
- QA Lead: [assign]

Update this doc as items are completed and use it to sign off before production.

