# AzStudio Main Services (Migrated)

This directory contains a set of service modules migrated from the Electron-based `azstudio` project into the AzStudio Workbench (formerly `azstudio-vscode`). These modules are here as a starting point for integrating Azora's AI features into the Workbench runtime.

Migration notes:
- These files have been copied with minimal change; they can contain Node/Electron APIs (e.g., `fs`, `process.env`, `openai` SDK usage).
- Before enabling these files in the build, refactor platform-specific APIs to use Workbench services (FileService, extension host APIs) and add necessary dependencies in `azstudio/package.json`.
- Ensure all third-party dependencies and licenses are reviewed and included in `ThirdPartyNotices.txt`.

Example files:
- AICodeCompletion.ts
- AIOrchestrator.ts
- ProjectIndexer.ts
- ContextManager.ts

Checklist to integrate:
1. Add any missing dependencies to `azstudio/package.json` (e.g., openai, @anthropic-ai/sdk, @babel/parser, @babel/traverse, glob)
2. Replace Node-only APIs with VS Code/Workbench service equivalents
3. Wire into the VS Code extension host or workbench (commands, providers, UI components)
4. Add tests (unit/integration) and run CI
5. Add premium entitlements gating and usage tracking if required
