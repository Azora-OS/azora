# Linting & Type Checking Guide

This document describes the linting and type checking workflows for the Azora OS project.

## Overview

The CI/CD pipeline includes automated linting and type checking to ensure code quality and consistency across all services, applications, and packages.

## Workflows

### 1. Linting Workflow (`lint.yml`)

Runs ESLint, Prettier, and Markdown linting on every push and pull request.

**Triggers:**
- Push to `main` or `develop` branches
- Pull request to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

**Jobs:**
- **ESLint**: Checks TypeScript and JavaScript files for code quality issues
- **Prettier**: Verifies code formatting consistency
- **Markdown**: Lints markdown files for consistency

**Status Check:** Required - must pass before merging PRs

### 2. Type Checking Workflow (`typecheck.yml`)

Runs TypeScript compiler in strict mode to validate type safety.

**Triggers:**
- Push to `main` or `develop` branches
- Pull request to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

**Jobs:**
- **TypeScript Validation**: Runs TypeScript compiler with strict mode enabled
- Verifies no implicit any types
- Generates type checking reports

**Status Check:** Required - must pass before merging PRs

### 3. Consolidated CI Workflow (`ci-lint-and-type-check.yml`)

Combines linting and type checking into a single workflow for efficiency.

**Triggers:**
- Push to `main` or `develop` branches
- Pull request to `main` or `develop` branches
- Manual trigger via `workflow_dispatch`

**Jobs:**
- **Lint & Type Check**: Runs ESLint and TypeScript validation in parallel
- Generates reports and artifacts
- Comments on PRs with results

**Status Check:** Required - must pass before merging PRs

## Local Development

### Running Linting Locally

```bash
# Run ESLint on all TypeScript and JavaScript files
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Run ESLint with specific options
npm run lint -- --format json --output-file report.json
```

### Running Type Checking Locally

```bash
# Run TypeScript compiler in strict mode
npm run typecheck

# Run with additional options
npm run typecheck -- --listFiles
```

### Running All Checks

```bash
# Run both linting and type checking
npm run lint && npm run typecheck
```

## Configuration Files

### ESLint Configuration (`.eslintrc.json`)

- **Parser**: `@typescript-eslint/parser`
- **Extends**: ESLint recommended + TypeScript recommended rules
- **Strict Rules**:
  - No explicit any types
  - No unused variables
  - No floating promises
  - Require explicit function return types
  - Enforce strict equality

### TypeScript Configuration (`tsconfig.base.json` and `tsconfig.json`)

- **Strict Mode**: Enabled
- **Key Settings**:
  - `noImplicitAny`: true
  - `strictNullChecks`: true
  - `strictFunctionTypes`: true
  - `noUnusedLocals`: true
  - `noUnusedParameters`: true
  - `noImplicitReturns`: true

### Prettier Configuration (`.prettierrc`)

Defines code formatting standards for consistency.

### Markdown Linting Configuration (`.markdownlint.json`)

Defines markdown formatting standards.

## Fixing Common Issues

### ESLint Errors

1. **No explicit any**
   ```typescript
   // ❌ Wrong
   const value: any = getData();
   
   // ✅ Correct
   const value: DataType = getData();
   ```

2. **Unused variables**
   ```typescript
   // ❌ Wrong
   const unused = getValue();
   
   // ✅ Correct (prefix with underscore if intentionally unused)
   const _unused = getValue();
   ```

3. **Missing return type**
   ```typescript
   // ❌ Wrong
   function getValue() {
     return 42;
   }
   
   // ✅ Correct
   function getValue(): number {
     return 42;
   }
   ```

### TypeScript Errors

1. **Implicit any**
   ```typescript
   // ❌ Wrong
   function process(data) {
     return data.value;
   }
   
   // ✅ Correct
   function process(data: DataType): number {
     return data.value;
   }
   ```

2. **Null/undefined issues**
   ```typescript
   // ❌ Wrong
   const value = getValue(); // might be null
   console.log(value.length);
   
   // ✅ Correct
   const value = getValue();
   if (value !== null) {
     console.log(value.length);
   }
   ```

## Artifacts

The workflows generate the following artifacts:

- **eslint-report.json**: ESLint violations in JSON format (30-day retention)
- **typecheck-report.txt**: TypeScript compilation output (30-day retention)

These artifacts are available in the GitHub Actions workflow run details.

## PR Comments

When a PR is created or updated, the CI workflow will comment with:
- ESLint error and warning counts
- TypeScript validation status
- Links to detailed reports

## Troubleshooting

### Workflow Fails Locally but Passes in CI

1. Ensure you're using the same Node.js version (20.x)
2. Clear node_modules and reinstall: `rm -rf node_modules && npm ci`
3. Check for environment-specific issues

### ESLint Cache Issues

```bash
# Clear ESLint cache
npx eslint --cache --cache-location .eslintcache --init
```

### TypeScript Cache Issues

```bash
# Clear TypeScript incremental build cache
rm -rf .tsbuildinfo
npm run typecheck
```

## Best Practices

1. **Fix issues early**: Run `npm run lint` and `npm run typecheck` before committing
2. **Use auto-fix**: Use `npm run lint:fix` to automatically fix many linting issues
3. **Type everything**: Always provide explicit types for function parameters and return values
4. **Avoid any**: Never use `any` type; use proper types or generics instead
5. **Keep it clean**: Remove unused imports and variables regularly

## Integration with IDEs

### VS Code

Install the following extensions:
- ESLint: `dbaeumer.vscode-eslint`
- Prettier: `esbenp.prettier-vscode`

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["typescript", "typescriptreact"],
  "eslint.format.enable": true
}
```

## References

- [ESLint Documentation](https://eslint.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prettier Documentation](https://prettier.io/)
- [Markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
