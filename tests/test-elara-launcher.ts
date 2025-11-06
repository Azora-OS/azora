/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * TEST SCRIPT FOR ELARA MASTER LAUNCHER
 *
 * Simple test to verify the Elara launcher functionality
 */

import { elaraMasterLauncher } from './genome/elara-master-launcher';

async function testLauncher() {
  console.log('🧪 TESTING ELARA MASTER LAUNCHER');
  console.log('================================');

  // Test getting system status
  const status = elaraMasterLauncher.getSystemStatus();
  console.log('Initial system status:', JSON.stringify(status, null, 2));

  console.log('\n✅ Elara launcher test completed successfully!');
}

testLauncher().catch(console.error);
