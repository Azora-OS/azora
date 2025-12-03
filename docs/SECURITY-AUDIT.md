### Security Audit (Initial Pass)

Scope of this pass:
- Establish baseline security documentation and validation scaffolding.

Actions completed:
- Added root SECURITY.md with reporting process and baseline measures.
- Added services/shared/env-schema.ts for environment variable validation using Zod.
- Ensured Node 20.11.0 via .nvmrc and .node-version for consistent security posture.
- Introduced CI pipeline to run lint, typecheck, and tests.

Findings (to be addressed in subsequent passes):
- Rate limiting, CSRF protection, CORS hardening, and security headers (helmet) not uniformly implemented across services.
- Secrets policy document is missing.
- No centralized environment variable schema enforcement at service boot time.
- Security scanning workflow (npm audit/Snyk) not yet configured in CI.
- Authentication flow documentation requires consolidation and verification.

Recommended next actions:
- Implement security.yml workflow for npm audit and Snyk scanning.
- Add centralized middleware packages for helmet, CORS, CSRF, and rate limiting, and adopt across all services.
- Create a secrets policy and rotate any dev/test secrets as needed.
- Add environment variable validation at service startup using services/shared/env-schema.ts.
- Document authentication and authorization flows per service.
