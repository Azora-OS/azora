/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

EXAMPLE: Service Design Tokens Template
Use this as a template when creating design-tokens.ts for new services
*/

// Re-export from central design system
export { 
  AZORA_GEM_COLORS,
  AZORA_GEM_TOKENS,
  SAPPHIRE_COLORS,
  EMERALD_COLORS,
  RUBY_COLORS,
  UBUNTU_COLORS,
  getGemColor,
  getUbuntuSpacing
} from '../../../apps/azora-ui/lib/design-system/azora-gem-tokens'

// Service-specific design tokens
export const SERVICE_DESIGN_TOKENS = {
  // Service-level spacing
  servicePadding: 'var(--space-ubuntu-lg)',
  serviceGap: 'var(--space-ubuntu-md)',
  
  // Service colors (customize based on service purpose)
  service: {
    primary: 'var(--sapphire-500)',    // Technology services
    // primary: 'var(--emerald-500)', // Education services
    // primary: 'var(--ruby-500)',     // Finance services
    secondary: 'var(--emerald-500)',
    accent: 'var(--ruby-500)',
  },
  
  // Service shadows
  serviceShadow: 'var(--shadow-lg)',
  serviceGlow: 'var(--glow-sapphire)',
  
  // Service-specific overrides
  // Add your service-specific tokens here
}

export default SERVICE_DESIGN_TOKENS
