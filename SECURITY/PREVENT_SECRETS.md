# Prevent Secrets from Being Committed

This repository includes a pre-commit hook and CI workflows to prevent committing secrets. This file documents how it works and how contributors should use the tools.

What we added
------------
- `scripts/prevent-secrets.js`: A Node script run by the Husky pre-commit hook that scans staged files for common secret patterns and fails the commit if any are found.
- `.husky/pre-commit`: Updated to run the script and also use `trufflehog` if installed.
- `.github/workflows/pr-secret-blocker.yml`: A PR workflow that runs `trufflehog` and fails the PR on secret detection.

Local usage
-----------
Husky hooks should be installed automatically for most contributors when they run `npm ci`.

If your repository a main branch that has been rewritten, contributors must be instructed to re-clone the repository.
See `SECURITY/POST-PURGE-CHECKLIST.md` for an incoming 're-clone and reset' checklist.

To manually install Husky (if needed):
```bash
npm install
npx husky install
npx husky add .husky/pre-commit "npm run -s precommit"
```
or ensure `.husky` hooks are present.

Best practices for contributors
-----------------------------
- Never store real secrets in `.env` committed files. Use `.env.example` for placeholders.
- Use GitHub Secrets or a secrets manager for CI and production deployments.
- If you accidentally committed secrets, see `SECURITY/README-ROTATE-SECRETS.md` and follow remediation steps.

Maintainers
-----------
If CI detects secrets in a PR, follow the steps in `SECURITY/README-ROTATE-SECRETS.md`. Ensure that the remediation includes purging the secrets from git history when necessary and rotating the leaked credentials.

