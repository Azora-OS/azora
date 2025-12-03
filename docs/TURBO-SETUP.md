# Using Turborepo in Azora monorepo

This repository has been organized into a monorepo using npm workspaces and Turborepo to provide fast parallel builds and caching.

Quick developer steps:

1. Install dependencies (root):

```powershell
cd C:\Users\Azora Sapiens\Documents\azora
npm ci
```

2. Run everything in development mode (parallel):

```powershell
npm run dev
```

3. Build the entire monorepo (caches enabled):

```powershell
npm run build
```

4. Run tests across the monorepo:

```powershell
npm run test
```

Useful VS Code settings
-- Add these to the workspace settings to reduce noise and use the root TS/ESLint configuration
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.packageManager": "npm"
}
```

This documentation is minimal; use `turbo inspect` and `npm run turbo:inspect` to explore caches and pipeline details.

If you plan to use pnpm or yarn, please update the `workspaces` configuration and package manager accordingly. `turbo` integrates well with any workspace manager.

Important note: The `azstudio` folder historically contained a nested Git repository (a VS Code clone); nested `.git` folders can interfere with workspace operations and CI. If `azstudio` should be part of the top-level monorepo, remove the nested `.git` folder and commit at the root; otherwise maintain it as a separate repo and remove it from workspace patterns to prevent accidental workspace installations.
