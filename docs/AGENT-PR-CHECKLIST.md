<!-- PR Checklist for Coding Agents -->

# PR Checklist for Agent Submissions

Before creating a PR, ensure the following are included and the CI pipeline passes.

## PR Metadata
- Title uses the format: `[phase/<area>] short description — #<task-id>`
- PR includes a short description, list of related file changes, and list of related tasks or tickets.
- Add reviewers: `@engineering-team`, `@security-team`.

## Code & Tests
- New code includes unit tests covering new logic.
- Integration tests exist for interactions between services (especially for payment/collection flows).
- E2E tests added if the change is user-facing.
- Security-oriented changes include automated security test step(s).
- Update/add OpenAPI docs for any new REST endpoints.

## Documentation
- Update README or specific docs with minimal steps to verify manually.
- Link to `docs/MASTER-TASKLIST-FOR-AGENTS.md` where applicable.
- Include local test instructions and relevant environment variables.

## CI & Linting
- `npm test` passes and coverage is acceptable (repo standard).
- Linting and formatting checks pass.

## Deployment Considerations
- Any helm or Kubernetes changes must include chart updates and version bump.
- Secrets or config changes use environment files and not committed to git.

## Sign Off
- Mark the PR as ready for review when all steps above are complete and add a summary of verification steps.

---

Use this checklist to ensure PRs are high-quality and reviewable by human maintainers.

