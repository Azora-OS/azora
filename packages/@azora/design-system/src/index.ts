/**
 * @azora/design-system
 * Unified Design System for Azora OS
 * 
 * "Ubuntu Philosophy Meets Quantum Technology"
 * "Ngiyakwazi ngoba sikwazi" - I can because we can
 */

import { AZORA_CORE, UBUNTU_PRINCIPLES, CONSTITUTIONAL_ARTICLES } from '@azora/core';

// Re-export tokens
export * from './tokens';

// Re-export components
export * from './components';

// Re-export utilities
export { cn } from './utils/cn';

// Re-export lib
export { UbuntuEngine } from './lib/ubuntu-engine';
export type { UbuntuCollaborator, NetworkCluster } from './lib/ubuntu-engine';

// Re-export core constants
export { AZORA_CORE, UBUNTU_PRINCIPLES, CONSTITUTIONAL_ARTICLES };

/**
 * Brand Constants
 */
export const BRAND = {
  name: AZORA_CORE.name,
  version: AZORA_CORE.version,
  tagline: 'Universal Human Infrastructure',
  philosophy: AZORA_CORE.philosophy,
  motto: AZORA_CORE.motto,
  engine: AZORA_CORE.engine,
} as const;

export type Brand = typeof BRAND;
