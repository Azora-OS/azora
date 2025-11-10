/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

TRINITY GEM INTEGRATION
Integrates Trinity Gem (Emerald, Ruby, Sapphire) into system dashboards
*/

import { getGemColor } from '@azora/shared-design/tokens';

/**
 * Trinity Gem Colors
 */
export const TRINITY_GEM = {
  EMERALD: {
    name: 'Emerald',
    color: getGemColor('emerald', '500'),
    domain: 'education',
    description: 'Emerald Foundation - Education & Learning',
  },
  RUBY: {
    name: 'Ruby',
    color: getGemColor('ruby', '500'),
    domain: 'finance',
    description: 'Ruby Core - Financial Services',
  },
  SAPPHIRE: {
    name: 'Sapphire',
    color: getGemColor('sapphire', '500'),
    domain: 'marketplace',
    description: 'Sapphire Apex - Marketplace & Tech',
  },
} as const;

/**
 * Get gem color for domain
 */
export function getDomainGem(domain: 'education' | 'finance' | 'marketplace'): typeof TRINITY_GEM.EMERALD {
  switch (domain) {
    case 'education':
      return TRINITY_GEM.EMERALD;
    case 'finance':
      return TRINITY_GEM.RUBY;
    case 'marketplace':
      return TRINITY_GEM.SAPPHIRE;
  }
}

/**
 * Trinity Gem Theme Provider
 */
export function getTrinityGemTheme(domain: 'education' | 'finance' | 'marketplace') {
  const gem = getDomainGem(domain);
  
  return {
    primary: gem.color,
    domain: gem.domain,
    name: gem.name,
    description: gem.description,
    colors: {
      50: getGemColor(gem.domain === 'education' ? 'emerald' : gem.domain === 'finance' ? 'ruby' : 'sapphire', '50'),
      100: getGemColor(gem.domain === 'education' ? 'emerald' : gem.domain === 'finance' ? 'ruby' : 'sapphire', '100'),
      500: gem.color,
      900: getGemColor(gem.domain === 'education' ? 'emerald' : gem.domain === 'finance' ? 'ruby' : 'sapphire', '900'),
    },
  };
}

export default TRINITY_GEM;
