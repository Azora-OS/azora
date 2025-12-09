# Payments Runbook (Azora Pay)

## Purpose
- Runbook for incidents with `services/azora-pay` payments, escrow and reconciliation issues.

## Monitoring & Alerts
- Alerts:
  - Reconciliation mismatch > 0.1%
  - Payout queue backlog > threshold
  - Settlement failure on chain/middleware

## Incident Response Steps
1. Check payment ledger and reconciliation reports for mismatches.
2. Check chain/middleware logs for failed transactions and retry queues.
3. Pause payouts if there is suspected fraud or mismatch; escalate to legal & finance.
4. Implement a patch or rollback and re-run batch reconciliation.
5. Communicate to affected users and create incident ticket with remediation steps.

## Runbook Tasks
- Create a manual backup snapshot of ledger tables.
- Start reconciliation script to replicate transactions and identify mismatches.
- Confirm final state before unpausing payouts.
