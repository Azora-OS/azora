# Communication plan for security incident and history purge

This sample message can be used to notify contributors and stakeholders while you perform the purge.

Subject: URGENT: Repository History Purge & Credential Rotation

Hello team,

We have detected that secrets were committed to the repository and we are performing a coordinated purge of git history to remove them and rotate the credentials.

What we are doing:
- Rotating compromised keys (DB, Supabase, JWT, Stripe) and replacing them in secret managers.
- Rewriting git history to remove secrets and replace patterns with REDACTED.
- Updating CI/CD to use the new credentials and policies.
- Enforcing automated secret scanning and pre-commit hooks.

What you must do:
- DO NOT push changes to the repository until the cleanup is complete.
- Backup your local work: create patches or stash local changes.
- Re-clone the repository after we confirm the purge is complete: `git clone https://github.com/ORG/REPO.git`.

Timeline & contact:
- We estimate we will complete the purge by [time]. If you have urgent merge work, contact @azora-world/security-team

Thank you for your cooperation.

