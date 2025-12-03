##### SECURITY: Rotate Compromised Secrets & Purge Repo History

Summary
-------
This repository contained a committed `.env` file with potentially sensitive credentials. Follow this guide to rotate keys, remove sensitive data from history, and harden the repo.

Immediate steps (perform ASAP)
--------------------------------
1. **Rotate keys** in external services immediately:
   - Database credentials (change password and rotate DB user credentials)
   - Supabase/third-party API keys
   - Any exposed tokens (JWT secret, Stripe keys, AWS keys)

2. **Invalidate the compromised keys** and reissue new ones using your provider consoles.

3. Replace secrets in local dev/test environments with placeholders or environment-managed secrets (GitHub secrets).

4. Remove `.env` from the repository working tree and commit the change:
   ```bash
   git rm --cached .env
   git commit -m "chore: remove leaked .env containing secrets"
   git push origin main
   ```

5. **Purge secrets from git history** (requires repository admin):
   - Option A: `git-filter-repo` (recommended)
     ```bash
     pip install git-filter-repo
     git clone --mirror https://github.com/<org>/<repo>.git
     cd repo.git
     git-filter-repo --path .env --invert-paths
     git push --force --all
     git push --force --tags
     ```
   - Option B: BFG Repo Cleaner
     - See https://rtyley.github.io/bfg-repo-cleaner/ and follow instructions.

6. Notify team and rotate secrets wherever they appear (CI vars, cloud providers, etc.).

Hardening and prevention (follow-up steps)
------------------------------------------
- Add a `pre-commit` or `husky` hook that rejects commits with possible secrets.
- Use GitHub secret scanning (already present) and make it a required status check.
- Store production keys in a secrets manager (GitHub Actions Secrets, AWS Secrets Manager, Azure Key Vault, etc.)
- Add a CI check to fail PRs with exposed secrets (example: `trufflehog`, `detect-secrets`).
 - Add small helper scripts: `scripts/git-commit-push.sh` (unix) and `scripts/git-commit-push.ps1` (PowerShell) that commit, run scans, and push to a feature branch.
   - Use `npm run git:commit-push` to run the helper and safely push changes locally.
- If you use a `.env` for local development, add `ENV_TEMPLATE` or `.env.example` and ensure `.env` is in `.gitignore`.

Reporting & Remediation PRs
----------------------------
Create a PR documenting what was rotated and include links to issues/tickets for steps taken.

Contact and escalation
-----------------------
If you are not the owner, escalate to `@azora-world/security-team` (see `.github/CODEOWNERS`).

References
----------
- GitHub Secrets Management: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- GitHub Secret Scanning: https://docs.github.com/en/code-security/secret-scanning
- git-filter-repo: https://github.com/newren/git-filter-repo

