/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM INPUT COMPONENT - World-Class Input with Glassmorphic Effects
Chief Architect Approval: Sizwe Ngwenya ✨
*/

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 💎 PREMIUM INPUT COMPONENT
 * 
 * World-class input component with glassmorphic effects
 * Premium styling with focus states and animations
 * 
 * @ubuntu Individual input → Collective data harmony
 */
export interface PremiumInputProps extends React.ComponentProps<'input'> {
  variant?: 'glass' | 'solid' | 'outline'
  glow?: 'sapphire' | 'emerald' | 'ruby' | false
}

const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, type, variant = 'glass', glow = 'sapphire', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-xl border px-4 py-3 text-base',
          'transition-all duration-300',
          'placeholder:text-muted-foreground/60',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          // Variant styles
          variant === 'glass' && 'glass-light border-border/50 focus-visible:border-premium-sapphire-500',
          variant === 'solid' && 'bg-card border-border shadow-premium-sm focus-visible:border-premium-sapphire-500',
          variant === 'outline' && 'bg-transparent border-2 border-premium-sapphire-500/30 focus-visible:border-premium-sapphire-500',
          // Glow effects
          glow === 'sapphire' && 'focus-visible:glow-premium-sapphire',
          glow === 'emerald' && 'focus-visible:glow-premium-emerald',
          glow === 'ruby' && 'focus-visible:glow-premium-ruby',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
PremiumInput.displayName = 'PremiumInput'

export { PremiumInput }
