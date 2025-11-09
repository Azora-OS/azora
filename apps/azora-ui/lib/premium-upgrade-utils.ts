/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM UPGRADE UTILITIES - Helper functions for app-wide upgrades
Chief Architect Approval: Sizwe Ngwenya ✨
*/

/**
 * 💎 PREMIUM UPGRADE UTILITIES
 * 
 * Helper functions and constants for upgrading apps to premium UI
 */

/**
 * Premium CSS Import Path
 */
export const PREMIUM_CSS_PATH = '../../azora-ui/globals-premium.css'

/**
 * Premium Component Imports
 */
export const PREMIUM_IMPORTS = {
  button: `import { PremiumButton } from '@/apps/azora-ui/components/ui/button-premium'`,
  card: `import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent, PremiumCardFooter } from '@/apps/azora-ui/components/ui/card-premium'`,
  input: `import { PremiumInput } from '@/apps/azora-ui/components/ui/input-premium'`,
  header: `import { PremiumHeader } from '@/apps/azora-ui/components/layout/premium-header'`,
  logo: `import { AzoraLogo } from '@/apps/azora-ui/components/branding'`,
  serviceLogo: `import { ServiceLogo } from '@/apps/azora-ui/components/branding'`,
}

/**
 * Premium Background Pattern Component
 */
export const PREMIUM_BACKGROUND_PATTERN = `
{/* 💎 PREMIUM UI SYSTEM - Glassmorphic Background Pattern */}
<div className="fixed inset-0 -z-10 bg-gradient-to-br from-premium-sapphire-500/5 via-premium-emerald-500/5 to-premium-ruby-500/5" />
<div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(12,124,232,0.1),transparent_50%)]" />
`

/**
 * Common Premium Class Replacements
 */
export const PREMIUM_CLASS_REPLACEMENTS = {
  // Buttons
  'bg-blue-500': 'gradient-premium-sapphire',
  'bg-green-500': 'gradient-premium-emerald',
  'bg-red-500': 'gradient-premium-ruby',
  'bg-white': 'glass-medium',
  'bg-gray-100': 'glass-light',
  
  // Cards
  'bg-white rounded-lg shadow': 'glass-medium rounded-2xl shadow-premium-md',
  'bg-white p-6 rounded-lg': 'glass-medium p-6 rounded-2xl',
  
  // Borders
  'border border-gray-300': 'border border-border/50',
  'border-2 border-blue-500': 'border-2 border-premium-sapphire-500',
  
  // Shadows
  'shadow-md': 'shadow-premium-md',
  'shadow-lg': 'shadow-premium-lg',
  
  // Radius
  'rounded-md': 'rounded-xl',
  'rounded-lg': 'rounded-2xl',
}

/**
 * Premium Variant Mapping
 */
export const PREMIUM_VARIANTS = {
  technology: {
    glow: 'sapphire',
    gradient: 'gradient-premium-sapphire',
    color: 'premium-sapphire-500',
  },
  education: {
    glow: 'emerald',
    gradient: 'gradient-premium-emerald',
    color: 'premium-emerald-500',
  },
  finance: {
    glow: 'ruby',
    gradient: 'gradient-premium-ruby',
    color: 'premium-ruby-500',
  },
}

/**
 * Helper: Get premium classes for a component type
 */
export function getPremiumClasses(type: 'button' | 'card' | 'input' | 'container') {
  const classes = {
    button: 'gradient-premium-sapphire text-white shadow-premium-md hover:shadow-premium-lg hover:scale-105 glow-premium-sapphire rounded-xl px-6 py-3',
    card: 'glass-medium rounded-2xl border border-border/50 shadow-premium-md hover:shadow-premium-lg hover:scale-[1.02]',
    input: 'glass-light border-border/50 rounded-xl px-4 py-3 focus-visible:border-premium-sapphire-500 focus-visible:glow-premium-sapphire',
    container: 'container mx-auto px-6 py-12',
  }
  return classes[type]
}

/**
 * Helper: Upgrade standard component to premium
 */
export function upgradeToPremium(component: string, type: 'button' | 'card' | 'input') {
  // This would be used in automated upgrade scripts
  return component.replace(
    /className="([^"]*)"/g,
    (match, classes) => {
      const premiumClasses = getPremiumClasses(type)
      return `className="${classes} ${premiumClasses}"`
    }
  )
}

export default {
  PREMIUM_CSS_PATH,
  PREMIUM_IMPORTS,
  PREMIUM_BACKGROUND_PATTERN,
  PREMIUM_CLASS_REPLACEMENTS,
  PREMIUM_VARIANTS,
  getPremiumClasses,
  upgradeToPremium,
}
