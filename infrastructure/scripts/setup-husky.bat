@echo off
REM Setup Husky pre-commit hooks for Windows
REM Run this after npm install

echo Setting up Husky pre-commit hooks...

REM Initialize Husky
call npx husky init

REM Create pre-commit hook
echo #!/usr/bin/env sh > .husky\pre-commit
echo . "$(dirname -- "$0")/_/husky.sh" >> .husky\pre-commit
echo. >> .husky\pre-commit
echo # Run lint-staged >> .husky\pre-commit
echo npx lint-staged >> .husky\pre-commit

echo Husky setup complete!
echo.
echo Pre-commit hook will now:
echo   - Run ESLint on staged files
echo   - Run Prettier on staged files
echo   - Prevent commit if errors found

pause

