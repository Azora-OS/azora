/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import { withdrawalOrchestrator } from '../services/finance/withdrawal-orchestrator';

async function main() {
  const amountArg = process.argv.find(a => /^--amount=/.test(a));
  const destArg = process.argv.find(a => /^--dest=/.test(a));
  const referenceArg = process.argv.find(a => /^--ref=/.test(a));

  const amountZAR = amountArg ? Number(amountArg.split('=')[1]) : NaN;
  const destination = (destArg ? destArg.split('=')[1] : 'bank') as 'bank' | 'luno';
  const reference = referenceArg ? referenceArg.split('=')[1] : undefined;

  if (!amountZAR || isNaN(amountZAR) || amountZAR <= 0) {
    console.error('Usage: tsx scripts/withdraw-now.ts --amount=10000 --dest=bank|luno [--ref=INV-001]');
    process.exit(1);
  }

  const res = await withdrawalOrchestrator.initiate({ amountZAR, destination, reference });
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.success ? 0 : 1);
}

main();


