/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM CARD COMPONENT - World-Class Card with Glassmorphic Effects
Chief Architect Approval: Sizwe Ngwenya ✨
*/

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 💎 PREMIUM CARD COMPONENT
 * 
 * World-class card component with glassmorphic effects
 * Premium styling with Azora branding integration
 * 
 * @ubuntu Individual content → Collective knowledge
 */
interface PremiumCardProps extends React.ComponentProps<'div'> {
  variant?: 'glass' | 'glassSapphire' | 'glassEmerald' | 'glassRuby' | 'solid' | 'gradient'
  glow?: 'sapphire' | 'emerald' | 'ruby' | 'gold' | false
  border?: 'sapphire' | 'emerald' | 'ruby' | 'gold' | false
}

function PremiumCard({ 
  className, 
  variant = 'glass',
  glow = false,
  border = false,
  ...props 
}: PremiumCardProps) {
  return (
    <div
      data-slot="premium-card"
      className={cn(
        'flex flex-col gap-6 rounded-2xl p-6 transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-premium-lg',
        // Variant styles
        variant === 'glass' && 'glass-medium',
        variant === 'glassSapphire' && 'glass-sapphire',
        variant === 'glassEmerald' && 'glass-emerald',
        variant === 'glassRuby' && 'glass-ruby',
        variant === 'solid' && 'bg-card border border-border shadow-premium-md',
        variant === 'gradient' && 'gradient-premium-sapphire text-white shadow-premium-lg',
        // Glow effects
        glow === 'sapphire' && 'glow-premium-sapphire',
        glow === 'emerald' && 'glow-premium-emerald',
        glow === 'ruby' && 'glow-premium-ruby',
        glow === 'gold' && 'glow-premium-gold',
        // Border effects
        border === 'sapphire' && 'border-premium-sapphire',
        border === 'emerald' && 'border-premium-emerald',
        border === 'ruby' && 'border-premium-ruby',
        border === 'gold' && 'border-premium-gold',
        className,
      )}
      {...props}
    />
  )
}

function PremiumCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="premium-card-header"
      className={cn(
        'flex flex-col gap-2 pb-4 border-b border-border/50',
        className,
      )}
      {...props}
    />
  )
}

function PremiumCardTitle({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="premium-card-title"
      className={cn(
        'text-2xl font-bold tracking-tight',
        'bg-gradient-to-r from-premium-sapphire-500 to-premium-emerald-500',
        'bg-clip-text text-transparent',
        className,
      )}
      {...props}
    />
  )
}

function PremiumCardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="premium-card-description"
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  )
}

function PremiumCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="premium-card-content"
      className={cn('flex-1', className)}
      {...props}
    />
  )
}

function PremiumCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="premium-card-footer"
      className={cn(
        'flex items-center gap-4 pt-4 border-t border-border/50',
        className,
      )}
      {...props}
    />
  )
}

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  PremiumCardFooter,
}
