# Orchestrator Runbook (AzStudio)

## Purpose
- Provide runbook for common incidents on `services/ai-orchestrator` and agent execution.

## Monitoring & Alerts
- Alerts to create:
  - Orchestrator down (no healthy instances)
  - Agent run failure rate p95 > 5% (for > 5 minutes)
  - Verification gate malfunctions (requests failing with 5xx)

## Incident Response Steps
1. Check `monitoring/` dashboards (Prometheus & Grafana) for error spikes and underlying errors.
2. Check logs in Loki for agent runs; identify last failing agent runId.
3. Isolate the issue: is it network, auth error, database, or verification failure?
4. If the verification pipeline is failing, check `services/constitutional-ai` logs and processing queue.
5. Consider rollback or restart for `services/ai-orchestrator` with `genome/elara-master-launcher.ts` for local.
6. Perform postmortem including root-cause, duration, and impact; identify bolt mitigations.

## Runbook tasks
- Create a postmortem ticket with timeline.
- Add a permanent monitoring check for any recovery metric.
