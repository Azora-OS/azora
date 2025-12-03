# AzStudio - Advanced AI-Powered IDE

[![Feature Requests](https://img.shields.io/github/issues/azora-technologies/azstudio/feature-request.svg)](https://github.com/azora-technologies/azstudio/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request+sort%3Areactions-%2B1-desc)
[![Bugs](https://img.shields.io/github/issues/azora-technologies/azstudio/bug.svg)](https://github.com/azora-technologies/azstudio/issues?utf8=✓&q=is%3Aissue+is%3Aopen+label%3Abug)
[![Discord](https://img.shields.io/badge/chat-on%20discord-7289DA.svg)](https://discord.gg/azora-technologies)

## The Repository

This repository is where we (Azora Technologies) develop **AzStudio**, the next-generation AI-powered IDE. Based on the robust foundation of VS Code, AzStudio integrates advanced AI capabilities, multi-agent collaboration, and a revolutionary Command Desk interface to transform the development experience.

This repository contains both Azora proprietary code and third-party components. Portions sourced from Microsoft\'s Visual Studio Code are licensed under MIT. Azora-authored code is proprietary and licensed under the Azora Proprietary License (see `LICENSE-AZORA.txt`). For a full breakdown of licenses and attributions, see `ThirdPartyNotices.txt` and `OWNERSHIP.md`.

## AzStudio

**AzStudio** combines the professional editing experience you know with groundbreaking AI innovations:

- **Command Desk**: A revolutionary AI interface that replaces traditional chat, integrating agents, knowledge, and build tools.
- **Multi-Agent Collaboration**: Specialized AI agents (Code, Design, Build, Debug, Review) working together to solve complex tasks.
- **Knowledge Ocean**: Deep semantic understanding of your codebase for context-aware assistance.
- **Build Spaces**: Intelligent build and deployment management directly within the IDE.

## Fine-Tuning & Innovation

AzStudio goes beyond traditional IDEs by incorporating architectural insights from leading tools like Windsurf and IntelliJ, while introducing unique features:

- **AI Rules Engine**: Context-aware behavior customization via `.azstudiorules`.
- **Platform-Grade Architecture**: Modular, scalable service design.
- **Professional Workflows**: Automated code review, security audits, and performance optimization.

## Contributing

We welcome contributions from the community! 

* [Submit bugs and feature requests](https://github.com/azora-technologies/azstudio/issues)
* Review [source code changes](https://github.com/azora-technologies/azstudio/pulls)
* Contribute to the [documentation](https://docs.azora-technologies.com/azstudio)

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

## Dev Quick Start (smoke test)

For a quick smoke test without installing heavy native dependencies, use the `dev-runner` which bundles mocked AI providers and verifies the migration logic.

1) Install Node 22.20.0 (or the version in `.nvmrc`).
2) From repo root:

```powershell
# Validate runtime environment (Windows)
powershell -ExecutionPolicy Bypass -File scripts\ci-check-environment.ps1

# Run a light smoke harness
cd dev-runner
npm ci
npm run build
node ./dist/ai-test.js
```

To force `premium` entitlements for local smoke testing without contacting the entitlement server, set the `AZSTUDIO_PREMIUM` env var:

```powershell
$env:AZSTUDIO_PREMIUM = 'true'
node ./dist/ai-test.js
```

For full development and building the AzStudio app (requires native modules and build tools), ensure you have Visual Studio Build Tools installed on Windows and run `npm ci` at the repo root.
You can also bootstrap the repo (recommended) to run the typical setup automatic steps:

```powershell
# from repo root
npm run bootstrap
```
If you do not have the Visual Studio Build Tools installed, you can use the helper script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-win-build-tools.ps1
```
This helper will try to use `winget` (if available) or download the Microsoft Visual Studio Build Tools installer and run it with the C++ workload.

## Build Windows EXE (CI)

This repository includes a GitHub Actions workflow that produces installer artifacts for Windows (`.exe`). The workflow is designed to run on `windows-2022` and uses the `gulp` tasks to compile and package the Electron app. For a full CI build, run the `Build AzStudio Windows` workflow in `.github/workflows/build-azstudio-windows.yml`.

Local Build Checklist (Windows):
1) Install Node 22.20.0 and Visual Studio Build Tools (C++ workload). Ensure `cl.exe` is in PATH.
2) From the repo root run:

```powershell
npm ci
powershell -ExecutionPolicy Bypass -File scripts\ci-check-environment.ps1
npm run gulp transpile-client-esbuild transpile-extensions
npm run gulp vscode-win32-x64-min-ci
npm run gulp vscode-win32-x64-inno-updater
```

Before running packaging gulp-tasks you may need to install build-only dependencies found under `build/` (for example `@vscode/vsce`). Use the helper:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-azstudio-build-deps.ps1
```

These steps are compatible with the automated workflow and will produce build artifacts under `.build\win32-x64` including system and user installers.

Note: If `npm ci` fails with a message about Spectre-mitigated libraries (MSB8040), open the Visual Studio Installer -> Modify the Build Tools installation -> Individual components -> and enable "Spectre-mitigated libraries" (or the labelled equivalent in your version of Visual Studio).

If you're running the bootstrap from Windows and want to attempt an automatic Build Tools install, you can run:

```powershell
# From repo root
npm run bootstrap:win
```

This will try to install the required Build Tools and then perform `azstudio` bootstrap steps.
If you prefer using GitHub Actions CI to produce the installer (recommended if you don't have Visual Studio Build Tools locally), run the `Build AzStudio Windows` workflow in `.github/workflows/build-azstudio-windows.yml`.
## Setup script

We provide cross-platform setup helpers that automate the typical local development setup steps.

Windows (PowerShell):
```powershell
# Interactive (checks and prompts):
powershell -ExecutionPolicy Bypass -File scripts\setup-dev.ps1 -Bootstrap -Compile -RunTests

# Non-interactive (try full install):
powershell -ExecutionPolicy Bypass -File scripts\setup-dev.ps1 -InstallBuildTools -Bootstrap -Compile -RunTests -Force
```

Unix/macOS (Bash):
```bash
# Bootstrap, compile, run tests and skip native builds:
./scripts/setup-dev.sh --bootstrap --compile --run-tests --skip-native

# Full install (allow native builds):
./scripts/setup-dev.sh --bootstrap --compile --run-tests
```

These scripts will run the environment checks, install dependencies (root and `azstudio`), and optionally compile the workspace and run dev smoke tests.




## Feedback

* [Request a new feature](https://github.com/azora-technologies/azstudio/issues)
* [File an issue](https://github.com/azora-technologies/azstudio/issues)
* Follow us on [Twitter/X](https://twitter.com/azora_tech)

## License

Copyright (c) Azora Technologies. All rights reserved.

Portions Copyright (c) Microsoft Corporation.

This project contains both proprietary Azora code and third-party open-source code. Azora-owned code is released under the Azora Proprietary License (see `LICENSE-AZORA.txt`). Third-party components (including the Visual Studio Code fork) remain under their original licenses (see `LICENSE.txt` and `ThirdPartyNotices.txt`).
