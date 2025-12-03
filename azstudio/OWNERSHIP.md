AzStudio Ownership & Licensing

This repository contains a mixture of: (1) third-party open-source components and (2) proprietary Azora Technologies code.

1) Azora-owned code
- Files and directories under `src/vs/workbench/contrib/azstudio/` (and other files explicitly marked `Copyright (c) Azora Technologies`) are Azora's proprietary code.
- Azora-owned code is distributed under a proprietary Azora license (see `LICENSE-AZORA.txt`).

2) Third-party open-source code
- The repository includes open-source components (e.g., Microsoft Visual Studio Code forks and community packages) whose original licenses are preserved.
- The primary third-party license(s) for upstream project(s) are retained in this repository, especially `LICENSE.txt` (MIT) and `ThirdPartyNotices.txt`.

3) How to interpret licensing in this tree
- Where a file contains a Microsoft or other vendor `Copyright` header, the original license should be preserved.
- Where a file is authored by Azora (Azora header), it is designated as proprietary.
- Azora may modify third-party code. Such modifications must comply with the original license, and any derivative works must retain required attributions and notices.

4) Rebranding & Attribution Guidance
- We replaced public-facing mentions of "VS Code/Visual Studio Code" in the documentation with "AzStudio" and clarified which parts of the codebase are Azora's proprietary work.
- We preserved all third-party license text and the `ThirdPartyNotices.txt` file.

5) Next steps / Governance (recommended)
- Keep `ThirdPartyNotices.txt` and `LICENSE.txt` intact.
- When making changes derived from third-party sources (e.g., replacing or updating files from Microsoft/VS Code), add clear attribution lines and preserve existing license text per the upstream license requirements.

6) Migration note
- In `src/vs/workbench/contrib/azstudio/mainServices/` some files were safely copied from the Electron-based `azstudio` repository as part of a migration plan. These files must be validated for runtime compatibility and license compliance prior to shipping as part of AzStudio.
	- Files: `AICodeCompletion.ts`, `AIOrchestrator.ts`, `ProjectIndexer.ts`, `ContextManager.ts` (examples)
	- Ensure you add open-source client dependencies (e.g., `openai`, `@anthropic-ai/sdk`, `@babel/parser`) to the `azstudio` Workbench package configuration and follow licensing guidance.

	7) Migration Operational Constraints
	- Keep `azstudio` (Electron build — archived via `azstudio.old`) and `azstudio` (Workbench build) available during migration and testing. Archive or delete files only after successful validation and legal approval.
	- Use product feature flags (`product.json.featureFlags`) and `AZSTUDIO_PREMIUM` environment variable to gate premium features during development and QA.
	- The `azstudio` Workbench build will require Visual Studio components and native build toolchains on Windows for certain native modules (e.g., `@vscode/windows-registry`). Configure CI accordingly.

If you have any licensing questions or need a formal legal review, consult Azora's legal team before changing or adding new license metadata.
