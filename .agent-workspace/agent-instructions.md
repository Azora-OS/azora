# 📋 Quick Reference: Agent Instructions

## 🔐 Q-Agents 1-4: Security Headers

**Template Location:** `.agent-workspace/templates/next-security-headers.js`

**Your Task:**
1. Navigate to your assigned app directory
2. Check if `next.config.js` exists
3. If YES: Merge the security headers into existing config
4. If NO: Copy the template as `next.config.js`
5. Report completion with file path

**Apps Assignment:**
- Q-Agent 1: `apps/azora-enterprise-ui/`
- Q-Agent 2: `apps/azora-marketplace-ui/`
- Q-Agent 3: `apps/azora-pay-ui/`
- Q-Agent 4: `apps/azora-student-portal/`

---

## 🔐 Q-Agent 5: Docker Secrets

**File:** `docker-compose.yml`

**Your Task:**
1. Find these lines and replace:
   - Line ~64: `JWT_SECRET=azora-super-secret-jwt-key-2025` → `JWT_SECRET=${JWT_SECRET}`
   - Line ~256: `POSTGRES_PASSWORD=azora` → `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`
   - Line ~340: `GF_SECURITY_ADMIN_PASSWORD=azora2025!` → `GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}`
2. Verify `.env.example` has these variables listed
3. Report completion

**DO NOT** modify the `.env` file itself!

---

## 📝 Q-Agent 6: DEPLOYMENT-STATUS.md

**File:** `DEPLOYMENT-STATUS.md`

**Your Task:**
1. Add at top: `> [!WARNING]\n> STATUS: MVP Development (Not Production)`
2. Replace all `🟢 Live` with `🟡 Development`
3. Replace metrics like "99.9% uptime" with "Monitoring not yet implemented"
4. Replace "88% test coverage" with "Coverage measurement in progress"
5. Report completion

---

## 📝 Q-Agent 7: README.md

**File:** `README.md`

**Your Task:**
1. Line ~11: Change "Production Ready" to "MVP Development"
2. Line ~44-46: Update service counts to match actual deployed
3. Update test coverage claims to "Measurement in progress"
4. Report completion

---

## 🧪 Q-Agent 8: Test Coverage

**Command:** `npm run test:coverage`

**Your Task:**
1. Run the command from project root
2. Capture ALL output (including errors)
3. Save to new file: `coverage-baseline.md`
4. Format as markdown with code blocks
5. Report completion with coverage percentage (or error message)

---

## 📦 Q-Agent 9: Component Inventory

**Directory:** `packages/shared-design`

**Your Task:**
1. Find all `.tsx` files in the directory
2. Create `component-inventory.md` with table:
   ```markdown
   | Component | Path | Lines | Type |
   |-----------|------|-------|------|
   ```
3. List each component found
4. Report completion with component count

---

## 🛠️ Q-Agent 10: VSCode Setup

**Templates:** 
- `.agent-workspace/templates/vscode-settings.json`
- `.agent-workspace/templates/vscode-extensions.json`

**Your Task:**
1. Create `.vscode/` directory in project root (if doesn't exist)
2. Copy `vscode-settings.json` to `.vscode/settings.json`
3. Copy `vscode-extensions.json` to `.vscode/extensions.json`
4. Report completion

---

## 📊 Reporting Format

When you complete your task, report in this format:

```
TASK COMPLETE: [Your Agent Number]
Files Modified: [list files]
Status: SUCCESS / FAILED
Notes: [any issues or observations]
Ready for Review: YES
```

---

## ⚠️ Important Rules

1. **One agent, one task** - Don't work on other agents' tasks
2. **No assumptions** - If unclear, ask Kiro
3. **Report honestly** - If you fail, say so
4. **Test your work** - Verify files are valid before reporting
5. **No shortcuts** - Follow the template exactly
