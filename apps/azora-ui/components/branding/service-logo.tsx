/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SERVICE LOGO COMPONENT - Premium Service Logo Display
Chief Architect Approval: Sizwe Ngwenya ✨
*/

'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getServiceLogo, getElaraLogo, SERVICE_LOGOS, ELARA_LOGOS } from '@/lib/branding/assets'

/**
 * 💎 SERVICE LOGO COMPONENT
 * 
 * Premium service logo component with glassmorphic effects
 * Supports all Azora services and Elara family
 * 
 * @ubuntu Individual service → Collective ecosystem
 */

type ServiceKey = keyof typeof SERVICE_LOGOS
type ElaraKey = keyof typeof ELARA_LOGOS

export interface ServiceLogoProps {
  service: ServiceKey | ElaraKey
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  glassmorphic?: boolean
  glow?: 'sapphire' | 'emerald' | 'ruby' | 'gold' | false
  variant?: 'azora' | 'elara'
}

const sizeMap = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
}

export function ServiceLogo({
  service,
  size = 'md',
  className,
  glassmorphic = false,
  glow = false,
  variant = 'azora',
}: ServiceLogoProps) {
  const logoPath = variant === 'elara' 
    ? getElaraLogo(service as ElaraKey)
    : getServiceLogo(service as ServiceKey)

  const dimensions = sizeMap[size]

  // Determine glow color based on service type
  const defaultGlow = variant === 'elara' ? 'sapphire' : 'emerald'

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        glassmorphic && 'glass-light rounded-xl p-2',
        (glow || glassmorphic) && `glow-premium-${glow || defaultGlow}`,
        className
      )}
    >
      <Image
        src={logoPath}
        alt={`${service} Logo`}
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain transition-transform duration-300 hover:scale-110"
        priority
      />
    </div>
  )
}

/**
 * Service Logo Grid - Display multiple services
 */
export function ServiceLogoGrid({
  services,
  variant = 'azora',
  size = 'md',
  className,
}: {
  services: (ServiceKey | ElaraKey)[]
  variant?: 'azora' | 'elara'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-4', className)}>
      {services.map((service) => (
        <ServiceLogo
          key={service}
          service={service}
          variant={variant}
          size={size}
          glassmorphic
          glow={variant === 'elara' ? 'sapphire' : 'emerald'}
        />
      ))}
    </div>
  )
}
