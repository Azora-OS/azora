# Agent Instructions (Local Task Pickup)

This guide explains how coding agents should pick up tasks locally without creating PRs or making major repo changes yet.

Important rules:
- Do not create Pull Requests for the tasks in this directory. These are for local agent task tracking only.
- Use the `docs/agents/agent-xx.tasks.md` files to find your task list.
- Update local status inside that agent's task file (not committed) to show progress, or optionally create a `local-progress/agent-xx.json` file when you start work.
- Before creating a PR to submit changes, confirm the work is production-ready, includes tests, and the PR meets `docs/AGENT-PR-CHECKLIST.md`.

How to use the files:
1. Open your agent file: `docs/agents/agent-01.tasks.md`.
2. Choose a task in the CRITICAL/HIGH sections and start with the first subtasks.
3. Update the task file locally (do not commit unless instructed) with `In Progress`, `Blocked`, or `Done` using the task title as an identifier.
4. Run the verification steps for the task and include logs or outputs in `local-progress/agent-xx/`.

Local utility commands (PowerShell):
```powershell
# Create your agent working folder
mkdir local-progress\agent-01 -Force

# Example: run tests for one service
cd services\azora-pay
npm ci
npm test
```

If your task requires changes to infrastructure, coordinate with the DevOps lead. If you do not have permission to run the choreography in the repo or CI changes, continue to work locally and add test outputs to `local-progress/agent-xx/`.

If you need to escalate or add a major architectural change, open an issue (or flag in team chat) and wait for approval before committing.

