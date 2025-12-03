# AzStudio -> AzStudio-VSCode Migration Plan

Overview
--------
This plan outlines the initial, safe steps to migrate AzStudio features from the Electron-based `azstudio` application into the Workbench fork (`azstudio`) (formerly `azstudio-vscode`). The goal is to consolidate Azora features under the AzStudio Workbench product, preserve third-party notices, and prepare the Workbench fork to become the premium product.

Important: No files are deleted by the script. The original `azstudio` files remain unchanged for review and rollback. Manual review and refactor steps are required for platform-specific code (e.g. Electron vs. Workbench, Node vs Browser runtime).

Phase A — Inventory & Safety Copying
----------------------------------
1. Inventory all Monaco/editor dependent files under `azstudio/src`.
2. Using the script `migrate-to-azstudio.ps1`, copy these files into `azstudio/src/vs/workbench/contrib/azstudio` in the following mapping (or from `azstudio.old` if present):
   - `azstudio.src/main/services/**` -> `azstudio/src/vs/workbench/contrib/azstudio/mainServices/**`
   - `azstudio/src/renderer/**` -> `azstudio/src/vs/workbench/contrib/azstudio/browser/**`

Phase B — Integration & Refactoring
1. Update the Workbench `azstudio` to include any runtime dependencies from the Electron `azstudio` (e.g., AI client SDKs, analytics libraries) and fix imports that expect Electron/Node-only APIs.
2. Replace Electron-specific modules (ipcRenderer/remote) with VS Code Workbench APIs and extension host calls.
3. Add licensing/gating: mark the new features as premium via product.json toggles or feature flags.
4. Add new integration tests and adapt UI tests as required.

Phase C — Validation & Finalization
1. Run TypeScript type-checks and unit tests in Workbench `azstudio`.
2. Run E2E Playwright tests and resolve any failures.
3. Gather legal & compliance signoff for any third-party code used in moved features.
4. Optional — once validated and confirmed by the team, rename or archive `azstudio/` to `azstudio.old`.

Constraints & Operational Guidance
---------------------------------
- Keep both the Electron `azstudio` build and the `azstudio-vscode` fork active during migration and testing; **do not** destructively remove or rename `azstudio` until the new build is validated and a legal compliance check passes.
- Implement feature flags and environment gating for premium features during the migration:
   - Use `product.json.featureFlags.premiumEnabledByDefault` (e.g., `false`) to control whether premium features are enabled by default.
   - Use environment variables (`AZSTUDIO_PREMIUM`) during local testing to force-enable features without production entitlements.
- CI/Build Requirements: The `azstudio-vscode` build requires native modules and Visual Studio components on Windows for some native dependencies (e.g., `@vscode/windows-registry`). Ensure CI runners have the necessary toolchains to run `npm install` and `gulp` builds.
- Legal signoff: Keep `ThirdPartyNotices.txt` intact and request a legal review before shipping (copy all import attributions and retain license texts).

Checklist
---------
- [ ] Inventory: create a per-file list of migration candidates (done manually)
- [x] Create script that safely copies candidate files to `azstudio` (added)
- [ ] Add import and dependency fixes for Workbench `azstudio` after copying
- [ ] Add premium toggles and product config changes for Workbench `azstudio`
- [ ] Update tests and run CI validations
- [ ] Legal compliance and third-party license review
- [ ] Archive and finalize repository state

Notes and Caveats
-----------------
- The script only copies files. It doesn't edit or fix imports / dependencies.
- Some files rely on Node/Electron APIs that are not available in the VS Code extension runtime — these must be refactored.
- Keep `ThirdPartyNotices` and original license files intact; do not remove them.

Next Steps
----------
1. Run the `migrate-to-azstudio-vscode.ps1` script locally to create the initial copies.
2. Start with small, safe feature moves: e.g. `AICodeCompletion.ts`, `AIOrchestrator.ts`, and related UI components.
3. Submit PRs per feature move; include tests and update `azstudio-vscode` package dependencies and integration code to pass CI.

Maintainers: Azora engineering team — coordinate with legal/engineering for final product launch and license gating.
