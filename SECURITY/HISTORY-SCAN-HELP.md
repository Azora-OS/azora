# History Scanning & Remediation Help

This document contains steps to scan the repository and to perform a complete purge if historical secrets are found.

Scan history using trufflehog (recommended):
```bash
# install trufflehog in a virtualenv or system
python -m pip install --upgrade pip
pip install trufflehog

# run on the full repo
trufflehog git file://. --json > trufflehog_output.json || true

# Review the results
cat trufflehog_output.json | jq '.[] | {commit: .commit, path: .path, reason: .reason, blob: .blob}'
```

If secrets are found in history, follow these steps:

1. DO NOT delete local branches; create a mirror clone for rewriting:
```bash
git clone --mirror https://github.com/ORG/REPO.git
cd REPO.git
```
2. Run `git-filter-repo` to remove the file `.env` and other sensitive files:
```bash
git filter-repo --invert-paths --paths .env --paths .env.test --paths .env.production
```
3. Apply textual replacement to remove tokens with `SECURITY/PATTERNS_TO_REDACT.txt`:
```bash
git filter-repo --replace-text ../SECURITY/PATTERNS_TO_REDACT.txt
```
4. Re-run trufflehog to confirm removed results.
5. Force push the history back to remote only after coordination and backup:
```bash
git push --force --all
git push --force --tags
```
6. Notify all contributors and require fresh clone.

If you prefer the BFG tool (easier for some patterns), use BFG instead of `git-filter-repo`. Be careful and test the rewrite on a backup mirror first.

