/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM HEADER COMPONENT - World-Class Header with Branding
Chief Architect Approval: Sizwe Ngwenya ✨
*/

'use client'

import React from 'react'
import { AzoraLogo } from '@/components/branding'
import { PremiumButton } from '@/components/ui/button-premium'
import { cn } from '@/lib/utils'

/**
 * 💎 PREMIUM HEADER COMPONENT
 * 
 * World-class header with glassmorphic effects and Azora branding
 * Premium navigation with proper logo integration
 * 
 * @ubuntu Individual navigation → Collective journey
 */
export interface PremiumHeaderProps {
  className?: string
  variant?: 'glass' | 'solid' | 'transparent'
  showLogo?: boolean
  logoSize?: 'sm' | 'md' | 'lg'
}

export function PremiumHeader({
  className,
  variant = 'glass',
  showLogo = true,
  logoSize = 'md',
}: PremiumHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        variant === 'glass' && 'glass-medium border-border/50 backdrop-blur-xl',
        variant === 'solid' && 'bg-card border-border shadow-premium-sm',
        variant === 'transparent' && 'bg-transparent border-transparent',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {showLogo && (
          <div className="flex items-center gap-4">
            <AzoraLogo
              variant="primaryPro"
              size={logoSize}
              glow="sapphire"
              animated
            />
            <span className="hidden text-xl font-bold md:block brand-gradient-triunity">
              Azora OS
            </span>
          </div>
        )}
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
            Products
          </a>
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
            Services
          </a>
          <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <PremiumButton variant="ghost" size="sm">
            Sign In
          </PremiumButton>
          <PremiumButton variant="premium" size="sm">
            Get Started
          </PremiumButton>
        </div>
      </div>
    </header>
  )
}
