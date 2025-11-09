/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AZORA LOGO COMPONENT - Premium Logo Display
Chief Architect Approval: Sizwe Ngwenya ✨
*/

'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getLogo } from '@/lib/branding/assets'

/**
 * 💎 AZORA LOGO COMPONENT
 * 
 * Premium logo component with glassmorphic effects
 * Supports all logo variants with premium styling
 * 
 * @ubuntu Individual brand → Collective identity
 */
export interface AzoraLogoProps {
  variant?: 'primary' | 'primaryPro' | 'white' | 'black' | 'animated'
  theme?: 'light' | 'dark' | 'auto'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  glassmorphic?: boolean
  glow?: 'sapphire' | 'emerald' | 'ruby' | 'gold' | false
  animated?: boolean
}

const sizeMap = {
  xs: { width: 32, height: 32 },
  sm: { width: 48, height: 48 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
  xl: { width: 128, height: 128 },
  '2xl': { width: 192, height: 192 },
}

export function AzoraLogo({
  variant = 'primary',
  theme = 'auto',
  size = 'md',
  className,
  glassmorphic = false,
  glow = false,
  animated = false,
}: AzoraLogoProps) {
  const logoPath = getLogo(
    theme === 'auto' 
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
  )

  const dimensions = sizeMap[size]

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        glassmorphic && 'glass-light rounded-2xl p-2',
        glow === 'sapphire' && 'glow-premium-sapphire',
        glow === 'emerald' && 'glow-premium-emerald',
        glow === 'ruby' && 'glow-premium-ruby',
        glow === 'gold' && 'glow-premium-gold',
        animated && 'animate-premium-scale',
        className
      )}
    >
      <Image
        src={logoPath}
        alt="Azora Logo"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          'object-contain',
          animated && 'transition-transform duration-300 hover:scale-110'
        )}
        priority
      />
    </div>
  )
}

/**
 * Premium Logo with Glassmorphic Background
 */
export function AzoraLogoPremium({
  variant = 'primaryPro',
  size = 'lg',
  className,
}: Omit<AzoraLogoProps, 'glassmorphic' | 'glow'>) {
  return (
    <div className={cn('relative', className)}>
      <div className="glass-strong rounded-3xl p-6 glow-premium-sapphire">
        <AzoraLogo
          variant={variant}
          size={size}
          glow="sapphire"
          animated
        />
      </div>
    </div>
  )
}

/**
 * Animated Logo Intro
 */
export function AzoraLogoAnimated({
  className,
}: {
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <Image
        src="/packages/public/branding/animated/logo-intro.svg"
        alt="Azora Logo Animation"
        width={200}
        height={200}
        className="object-contain animate-premium-fade-in"
        priority
      />
    </div>
  )
}
