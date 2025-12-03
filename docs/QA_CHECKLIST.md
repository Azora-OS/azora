# Azora QA Checklist 🚀

## 1️⃣ Local Test Execution
- [ ] Run unit tests for **all 58 services** (`npm test` in each service)
- [ ] Execute integration tests confirming cross‑service communication (Finance ↔ Master ↔ Cloud)
- [ ] Run ChaosMonkey simulations for the 7 failure types and verify PhoenixServer recovery strategies
- [ ] Test ResilienceAdapter offline‑first mode with simulated bandwidth drops

## 2️⃣ Documentation Audit
- [ ] Update architecture diagrams, service counts, and transformation layers in docs
- [ ] Archive previous docs into `docs/Legacy/` with version tags
- [ ] Ensure every repo has a consistent `README.md`
- [ ] Add clear developer setup instructions and contribution guide
- [ ] Verify all API reference docs match current endpoints

## 3️⃣ Repository Hygiene
- [ ] Confirm no duplicate services remain (66 → 58 verified)
- [ ] Enforce naming conventions across repos, branches, and commits
- [ ] Run linting (`npm run lint`) and static analysis (`npm run typecheck`)
- [ ] Audit dependency trees – no broken or outdated packages (`npm audit`)

## 4️⃣ Workflow Readiness
- [ ] Test GitHub Actions CI pipeline (`.github/workflows/ci-cd.yml`)
- [ ] Verify branch protection rules (main locked, PR reviews required)
- [ ] Simulate workflow: commit → trigger tests → build → deploy to staging
- [ ] Ensure rollback workflow exists and is tested

## 5️⃣ Deployment Validation
- [ ] Deploy to staging with full logging enabled
- [ ] Run end‑to‑end user flow tests (Education → Pay → Compliance → Ledger)
- [ ] Validate auto‑scaling under load (e.g., classroom live sessions)
- [ ] Confirm AML entries are generated for every transaction
- [ ] Test CitadelFund 10% redistribution and verify public‑goods ledger entries

## 6️⃣ Final QA Sign‑Off
- [ ] Generate QA Report with Launch Readiness Score (0‑100)
- [ ] List any failed tests, broken links, or missing docs
- [ ] Provide recommendations for fixes
- [ ] Archive QA logs into the Auditable Ledger for transparency
- [ ] Approve production deployment only after sign‑off

---
*This checklist is intended to be run by the engineering team before the final production release.*
