# Post-Purge Checklist and Communications

After purging the commit history to remove secrets, follow these post-purge steps to restore safety and operations:

1. Rotate credentials
   - Rotate database credentials, JWT secrets, API keys, and any other exposed keys listed in `SECURITY/PATTERNS_TO_REDACT.txt`.
   - Verify the new credentials work and update secret stores (GitHub secrets, Vault, etc).

2. Update deployment configuration
   - Ensure CI/CD systems (GitHub Actions secrets, hosting, K8s secrets) use the new tokens.
   - Replace plaintext secrets in configs with references to secret managers.

3. Re-protect your branches
   - Require CI checks (lint/typecheck/security scans) before merging.
   - Add `pr-secret-blocker.yml` to required status checks on protected branches (main, develop).

4. Notify contributors
   - Communicate to the team: everyone must re-clone the repository:
     ```bash
     git clone https://github.com/ORG/REPO.git
     ```
   - If contributors have local branches, they will need to rebase and reapply their changes on a fresh clone.

5. Perform a full secret scan
   - Run scheduled `trufflehog` or `detect-secrets` across the entire history and confirm no secrets remain.

6. Add additional hardening
   - Add scheduled secret scanning workflows and pre-commit hooks (we added `pre-commit` and `pr-secret-blocker.yml`).
   - Consider enabling GitHub secret scanning and secret policies to automatically detect new leaks.

7. Archive backups safely and remove any backup copies from public access.
   - Store sanitized backups offline if required for auditing but ensure they are not accessible publicly.

8. Create incident report
   - Describe the leak and the remediation steps. Follow organization process and notify relevant teams, security, and customer support if public exposure is suspected.

9. Verify observability and ingestion
   - Ensure your APM and logging do not log secrets by scanning logs to validate and update filters.

10. Recovery test
   - Test that apps start correctly using new secrets and run a CI build and E2E validation to ensure everything is functional.

