/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM CLASS UPGRADES - Automated class replacements for app-wide upgrades
Chief Architect Approval: Sizwe Ngwenya ✨
*/

/**
 * 💎 PREMIUM CLASS UPGRADES
 * 
 * Automated class replacement mappings for upgrading apps to premium UI
 * Use these to systematically upgrade components across all apps
 */

export const PREMIUM_CLASS_UPGRADES = {
  // Backgrounds
  'bg-white': 'glass-medium',
  'bg-gray-100': 'glass-light',
  'bg-gray-50': 'glass-light',
  'bg-card': 'glass-medium',
  
  // Cards
  'bg-card border border-border rounded-lg': 'glass-medium border border-border/50 rounded-2xl shadow-premium-md',
  'bg-white rounded-lg shadow': 'glass-medium rounded-2xl shadow-premium-md',
  'bg-white p-6 rounded-lg': 'glass-medium p-6 rounded-2xl',
  
  // Buttons
  'bg-blue-500': 'gradient-premium-sapphire',
  'bg-green-500': 'gradient-premium-emerald',
  'bg-red-500': 'gradient-premium-ruby',
  'bg-primary': 'gradient-premium-sapphire',
  'bg-secondary': 'gradient-premium-emerald',
  
  // Borders
  'border border-gray-300': 'border border-border/50',
  'border border-border': 'border border-border/50',
  'border-2 border-blue-500': 'border-2 border-premium-sapphire-500',
  
  // Radius
  'rounded-md': 'rounded-xl',
  'rounded-lg': 'rounded-2xl',
  'rounded': 'rounded-xl',
  
  // Shadows
  'shadow-md': 'shadow-premium-md',
  'shadow-lg': 'shadow-premium-lg',
  'shadow-sm': 'shadow-premium-sm',
  'shadow': 'shadow-premium-md',
  
  // Headers
  'bg-card border-b border-border': 'glass-medium border-b border-border/50 backdrop-blur-xl',
  
  // Sidebars
  'bg-card border-r border-border': 'glass-medium border-r border-border/50 backdrop-blur-xl',
  
  // Inputs
  'border border-border rounded-md bg-background': 'glass-light border border-border/50 rounded-xl',
  
  // Hover states
  'hover:bg-accent': 'hover:glass-light hover:shadow-premium-sm',
  'hover:bg-gray-50': 'hover:glass-medium',
  'hover:shadow-lg': 'hover:shadow-premium-lg hover:scale-[1.02]',
  
  // Text colors
  'text-blue-500': 'text-premium-sapphire-500',
  'text-green-500': 'text-premium-emerald-500',
  'text-red-500': 'text-premium-ruby-500',
}

/**
 * Helper: Upgrade className string with premium classes
 */
export function upgradeClassName(className: string): string {
  let upgraded = className
  
  // Apply all upgrades
  for (const [oldClass, newClass] of Object.entries(PREMIUM_CLASS_UPGRADES)) {
    // Replace exact matches and as part of class lists
    const regex = new RegExp(`\\b${oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    upgraded = upgraded.replace(regex, newClass)
  }
  
  // Add premium transitions if not present
  if (!upgraded.includes('transition-all') && (upgraded.includes('hover:') || upgraded.includes('focus:'))) {
    upgraded += ' transition-all duration-300'
  }
  
  return upgraded
}

/**
 * Helper: Upgrade component props
 */
export function upgradeComponentProps(props: any): any {
  if (props.className) {
    return {
      ...props,
      className: upgradeClassName(props.className),
    }
  }
  return props
}

export default PREMIUM_CLASS_UPGRADES
