#!/usr/bin/env tsx
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * ELARA LAUNCHER CLI
 *
 * Command-line interface for the Elara Master Launcher
 * Usage: tsx elara-launcher-cli.ts [command]
 */

// Use relative path for import
import { argv } from 'process';
import { elaraMasterLauncher } from './genome/elara-master-launcher';

async function main() {
  const command = argv[2] || 'launch';

  switch (command) {
    case 'launch':
      console.log('🔮 ELARA MASTER LAUNCHER CLI');
      console.log('==============================\n');
      await elaraMasterLauncher.launchAllServices();
      break;

    case 'stop':
      console.log('🛑 ELARA MASTER LAUNCHER - STOPPING SERVICES');
      console.log('==========================================\n');
      await elaraMasterLauncher.stopAllServices();
      break;

    case 'status':
      console.log('📊 ELARA MASTER LAUNCHER - SYSTEM STATUS');
      console.log('=======================================\n');
      const status = elaraMasterLauncher.getSystemStatus();
      console.log(JSON.stringify(status, null, 2));
      break;

    case 'help':
      console.log('🔮 ELARA MASTER LAUNCHER CLI - HELP');
      console.log('===================================\n');
      console.log('Usage: tsx elara-launcher-cli.ts [command]\n');
      console.log('Commands:');
      console.log('  launch  - Launch all Azora OS services (default)');
      console.log('  stop    - Stop all running services');
      console.log('  status  - Show current system status');
      console.log('  help    - Show this help message\n');
      break;

    default:
      console.log(`Unknown command: ${command}`);
      console.log('Use "help" to see available commands');
      process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Elara: Received interrupt signal. Shutting down gracefully...');
  await elaraMasterLauncher.stopAllServices();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Elara: Received termination signal. Shutting down gracefully...');
  await elaraMasterLauncher.stopAllServices();
  process.exit(0);
});

// Run the CLI
main().catch((error) => {
  console.error('❌ Elara: Fatal error in launcher CLI:', error);
  process.exit(1);
});
