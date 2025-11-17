#!/usr/bin/env node
/**
 * CLI wrapper for Knowledge Ocean setup
 */

import { runSetup } from './setup';

runSetup().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
