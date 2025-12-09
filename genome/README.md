Elara Master Launcher
=====================

This module provides a minimal Elara master launcher API and script that can be used to start, stop, and query the status of core Azora OS services (e.g., the AI Orchestrator).

Usage:

 - Programmatic API (import):
   - `import { elaraMasterLauncher } from 'genome/elara-master-launcher';`
   - `elaraMasterLauncher.launchAllServices()` - start services
   - `elaraMasterLauncher.stopAllServices()` - stop services
   - `elaraMasterLauncher.getSystemStatus()` - get current status

 - CLI:
   - `npx tsx genome/elara-master-launcher.ts launch` - starts all services
   - `npx tsx genome/elara-master-launcher.ts stop` - stops all services
   - `npx tsx genome/elara-master-launcher.ts status` - prints services status

Tests use a `DRY_RUN` flag to avoid spawning child processes by setting `ELARA_LAUNCHER_DRY_RUN=1`.

Notes:
 - This module runs services by spawning the `node` executable to run `services/*/index.js` files.
 - For test and CI convenience, set `ELARA_LAUNCHER_DRY_RUN=1` to simulate start/stop operations.
