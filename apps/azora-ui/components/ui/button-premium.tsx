/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM BUTTON COMPONENT - World-Class Button with Glassmorphic Effects
Chief Architect Approval: Sizwe Ngwenya ✨
*/

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * 💎 PREMIUM BUTTON COMPONENT
 * 
 * World-class button component with glassmorphic effects
 * Premium styling surpassing Google, Apple, Microsoft
 * 
 * @ubuntu Individual action → Collective excellence
 */
const premiumButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 min-h-[44px] min-w-[44px] px-6 py-3 relative overflow-hidden group",
  {
    variants: {
      variant: {
        // Premium Sapphire (Technology)
        premium: 'gradient-premium-sapphire text-white shadow-premium-md hover:shadow-premium-lg hover:scale-105 glow-premium-sapphire',
        
        // Premium Emerald (Education)
        education: 'gradient-premium-emerald text-white shadow-premium-md hover:shadow-premium-lg hover:scale-105 glow-premium-emerald',
        
        // Premium Ruby (Finance)
        finance: 'gradient-premium-ruby text-white shadow-premium-md hover:shadow-premium-lg hover:scale-105 glow-premium-ruby',
        
        // Premium Gold (Accent)
        accent: 'gradient-premium-gold text-white shadow-premium-md hover:shadow-premium-lg hover:scale-105 glow-premium-gold',
        
        // Glassmorphic variants
        glass: 'glass-medium text-foreground shadow-glassMedium hover:glass-strong hover:scale-105 border-premium-sapphire',
        glassSapphire: 'glass-sapphire text-white shadow-glassMedium hover:shadow-premium-lg hover:scale-105',
        glassEmerald: 'glass-emerald text-white shadow-glassMedium hover:shadow-premium-lg hover:scale-105',
        glassRuby: 'glass-ruby text-white shadow-glassMedium hover:shadow-premium-lg hover:scale-105',
        
        // Premium outline
        outline: 'border-2 border-premium-sapphire bg-transparent text-premium-sapphire-500 hover:bg-premium-sapphire-500 hover:text-white shadow-premium-sm hover:shadow-premium-md',
        
        // Premium ghost
        ghost: 'hover:glass-light hover:shadow-premium-sm text-foreground',
        
        // Premium link
        link: 'text-premium-sapphire-500 underline-offset-4 hover:underline hover:text-premium-sapphire-600',
      },
      size: {
        default: 'h-12 px-6 py-3 text-base',
        sm: 'h-10 rounded-lg px-4 py-2 text-sm',
        lg: 'h-14 rounded-xl px-8 py-4 text-lg',
        icon: 'size-12',
        'icon-sm': 'size-10',
        'icon-lg': 'size-14',
      },
    },
    defaultVariants: {
      variant: 'premium',
      size: 'default',
    },
  },
)

function PremiumButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof premiumButtonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="premium-button"
      className={cn(premiumButtonVariants({ variant, size, className }))}
      {...props}
    >
      {/* Shine effect */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </Comp>
  )
}

export { PremiumButton, premiumButtonVariants }
