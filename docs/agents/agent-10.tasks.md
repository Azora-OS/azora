# Agent 10 - Security, Penetration Tests & CI Security Automation

Primary Focus: Replace placeholders in the penetration tests and get security tests running in CI.

Priority: HIGH

Tasks:
1. Replace `return false; // Placeholder` occurrences in `tests/penetration/authorized-pentest-framework.ts` with real checks for headers, rate limits, etc.
   - Acceptance: The penetration test suite asserts the presence of `X-Frame-Options`, `X-Content-Type-Options`, `HSTS`, and a rate-limit header.

2. Add security integration test steps to CI: run penetration tests in `ci/security` pipeline and fail jobs on missing headers.
   - Files: `.github/workflows/security-tests.yml` and `tests/penetration/*`.
   - Acceptance: CI stage runs and fails if violations are found.

3. Scan and fix environment variable exposures and test for common secrets in repo.
   - Acceptance: `npm run secret:scan` or similar in CI; failing if secrets are present.

4. Add WAF rules and threat mitigation checks for the platform (document as runbooks).
   - Acceptance: Test cases show blocked requests for known threats.

Verification steps:
- Run `npm test` in `tests/penetration`, and verify test suite catches security policy violations.
- Verify the CI workflow includes the security stage and fails if tests fail.

