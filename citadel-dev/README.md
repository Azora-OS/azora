# Citadel Dev — Master Architecture & Tasks

This folder contains the Master Architecture Blueprint and the Master Implementation Task List for Azora.

Purpose:
- Keep a consolidated, high-fidelity architecture and implementation backlog for the entire ecosystem.
- Provide cross-links to repository paths and actionable, production-grade tasks.

Key files:
- Master_Architecture_Blueprint.md — System overview, C4 views, domain model, data architecture, security & SRE.
- tasks/Master_Implementation_Task_List.md — Exhaustive task list with priorities and acceptance criteria.
- architecture/C4_*.md — Per-domain C4 detailed architecture items.
- OWNERS.md — Room-to-team ownership mapping.

How to use:
- Use the Task List as the single source of truth for planning; split tasks into per-domain projects for tracking.
- Use the architecture files for reviews and onboarding new engineers.
- Ensure all tasks include `Verification` steps and reference `CONSTITUTION.md` for constitutional gating.

Next steps:
- Expand domain tasks into issue trackers (GitHub Projects/Jira).
- Link CI gates to the Constitutional AI Core verification pipeline.
- Finalize owners and teams in `OWNERS.md`.