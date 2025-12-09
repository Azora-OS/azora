No Mock Protocol Validator — README
=================================

Purpose
-------
The No Mock Protocol Validator scans the repository for code patterns that indicate mocks, placeholders, TODOs, and other signs of non-production code. This script is intended to be executed during CI to prevent shipping test artifacts or accidental placeholders to production releases.

Behavior
--------
- Default: The validator ignores common test patterns (files under `__tests__`, files matching `*.test.*` or `*.spec.*`, `__mocks__` folder, etc.) to avoid flagging valid test code.
- To include test files in the validation, set the environment variable `ALLOW_MOCKS_IN_TESTS=1` (or `true`) for the run.
- Inline exceptions can be used on a per-line basis using the token `NO_MOCK_EXCEPTION` as a comment. Example:

```js
jest.mock('./dep'); // NO_MOCK_EXCEPTION
```

Patterns the validator flags (non-exhaustive)
---------------------------------------------
- `mock(`
- `.mock` usage outside of common test patterns
- `jest.mock` outside test files
- `sinon.stub`
- `TODO:`, `FIXME:`
- `PLACEHOLDER`, `STUB`, `fake*`, `dummy*`
- `.*.skip(`, `.*.only(` — these are also flagged, as skipping or isolating tests might hide regressions.

How it's used in CI
-------------------
- The GitHub Actions workflow at `.github/workflows/ci-cd.yml` runs the validator in the `deployment-ready` job. The script installs dependencies and executes `node infrastructure/no-mock-validator.js`.
- By default, the validator will ignore tests. If your PR intends to add new test-only code that uses `jest.mock` or similar constructs, they will not fail CI. However, if you are changing core code that should not contain mocks, the validator will catch this.

Configuring behavior
--------------------
- `ALLOW_MOCKS_IN_TESTS=1`: Additionally scans and flags mocks in test files.
- Add a `NO_MOCK_EXCEPTION` comment token to a line to locally exclude that row from triggering violations. This is intentionally rare and should be limited to exceptional cases with justification.

Why ignore test files by default?
--------------------------------
Most test suites rely on mocks (e.g., `jest.mock`, `sinon.stub`). Flagging these would cause the validator to always fail CI. To keep the validator meaningful but not noisy, tests are ignored but production code-level mocks remain flagged.

Suggestions
-----------
- Use the inline exception token sparingly and provide a brief comment explaining why a line is exempt.
- If you find many false-positives in production code, we should update `ALLOWED_MOCK_PATTERNS` to add legitimate, documented exceptions.
- Consider adding a `NO_MOCK_ALLOWLIST` file that stores approved file paths or patterns for long-lasting exceptions (requires code change in the validator to read and apply it).

Running locally
---------------
1) Install dependencies (glob) if you don't already have them:
   powershell
   cd infrastructure; npm install; cd ..

2) Run the validator (default — ignores test files):
   powershell
   node infrastructure/no-mock-validator.js

3) Run the validator and include tests:
   powershell
   SET ALLOW_MOCKS_IN_TESTS=1; node infrastructure/no-mock-validator.js

4) To allow a single line to be excluded, add the token `NO_MOCK_EXCEPTION` as a comment on that line.

Change history
--------------
- 2025-12-06: Added default test file ignore behavior; added inline exception token and README.

Contact
-------
If you need a new exception or want to expand/limit scanning behavior, talk to the `OWNERS.md` listed owners for `infrastructure/no-mock-validator.js`.

---
_This document is a non-legally-binding explanation of the No Mock Protocol Validator. For production policy, see `CONSTITUTION.md` and project governance docs._
NO_MOCK_VALIDATOR — Usage & Behavior
====================================

Overview
--------

This validator (`no-mock-validator.js`) scans the repository for patterns that indicate mocks, stubs, placeholders, or non-production code (e.g. `mock()`, `jest.mock`, `TODO:`, `FIXME:`) and fails the CI build if violations are found.

Key Behaviors
-------------

1) Test Files Ignored by Default
- By default, the validator ignores files it considers test files. The following glob patterns are excluded from scanning:
  - `**/__tests__/**`
  - `**/*.test.*`
  - `**/*.spec.*`
  - `**/__mocks__/**`
  - `**/mocks/**`

This avoids flagging test-only mocks as violations while still enforcing policy on production code.

2) Toggling Test File Scanning
- To force the validator to include test files in scanning, set the environment variable `ALLOW_MOCKS_IN_TESTS` to a truthy value (`1` or `true`):

```powershell
SET ALLOW_MOCKS_IN_TESTS=1
node infrastructure/no-mock-validator.js
```

When this environment variable is set, the validator will also scan files that match the test patterns above.

3) Local Exception Token
- If a line should be allowed (a local, documented exception), add an inline comment token to the same line that you'd like to permit:

```js
jest.mock('./deps'); // NO_MOCK_EXCEPTION
someFakeFunction(); //NO_MOCK_EXCEPTION
const x = 1; /* NO_MOCK_EXCEPTION */
```

Both single-line (`// NO_MOCK_EXCEPTION`, `//NO_MOCK_EXCEPTION`) and inline block (`/* NO_MOCK_EXCEPTION */`) forms are recognized.

4) Exit Codes & CI
- Behavior remains the same for CI: the script exits with a non-zero exit code when violations are found and prints a report to stderr. If no violations are found, it exits with 0.

Notes & Good Practices
----------------------
- Use `NO_MOCK_EXCEPTION` sparingly; local exceptions should be documented and justified in code comments.
- This tool is meant to reduce the chance of shipping placeholder or test-only constructs into production. If you must use mocks/stubs in production code for valid reasons, consider creating an allowed exception pattern or refactoring the code.

Running the Validator
---------------------

Basic run:

```powershell
node infrastructure/no-mock-validator.js
```

Run including tests:

```powershell
SET ALLOW_MOCKS_IN_TESTS=1 ; node infrastructure/no-mock-validator.js
```

---

If anything needs clarification in this README, please file a PR with a suggested update.