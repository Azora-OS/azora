# 🤖 Agent Workspace

This directory contains files for agent coordination and task execution.

## 📁 Structure

```
.agent-workspace/
├── README.md (this file)
├── templates/          # Code templates for agents
├── completed/          # Completed task artifacts
└── validation/         # Validation scripts
```

## 🎯 Purpose

This workspace helps organize agent tasks and outputs to prevent conflicts and enable easy review.

## 📋 Usage

**For Kiro:**
- Track progress in `/day-1-progress.md` (root)
- Store completed work artifacts here
- Run validation scripts before approval

**For Q-Agents:**
- Use templates from `templates/` folder
- Report completion with file paths
- Do not modify other agents' work

**For QA Team (User + Antigravity):**
- Review work from this workspace
- Approve/reject based on quality
- Merge approved changes to main codebase
