/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import Image from 'next/image'
import { ComponentProps } from 'react'

interface ServiceLogoProps {
  serviceId: string
  size?: 'small' | 'medium' | 'large' | 'full'
  className?: string
}

const serviceLogoMap: Record<string, string> = {
  // Core Services
  'azora-os': '/branding/logo-primary-pro.svg',
  'sapiens': '/branding/services/azora-sapiens-logo.svg',
  'forge': '/branding/services/azora-forge-logo.svg',
  'covenant': '/branding/services/azora-covenant-logo.svg',
  'aegis': '/branding/services/azora-aegis-logo.svg',
  'oracle': '/branding/services/azora-oracle-logo.svg',
  'mint': '/branding/services/azora-mint-logo.svg',
  'nexus': '/branding/services/azora-nexus-logo.svg',
  'synapse': '/branding/services/azora-synapse-logo.svg',
  'pay': '/branding/services/azora-pay-logo.svg',
  'mail': '/branding/services/azora-pay-logo.svg', // TODO: Create dedicated
  'education': '/branding/services/azora-education-logo.svg',
  'scriptorium': '/branding/services/azora-scriptorium-logo.svg',
  'workspace': '/branding/services/azora-workspace-logo.svg',
  
  // Elara Family
  'elara': '/branding/services/elara-logo.svg',
  'elara-ide': '/branding/services/elara-ide-logo.svg',
  'elara-voice': '/branding/services/elara-voice-logo.svg',
  'elara-vision': '/branding/services/elara-vision-logo.svg',
  'elara-mind': '/branding/services/elara-mind-logo.svg',
  'elara-heart': '/branding/services/elara-heart-logo.svg',
  'elara-dreams': '/branding/services/elara-dreams-logo.svg',
}

const sizeMap = {
  small: { width: 200, height: 60 },
  medium: { width: 400, height: 120 },
  large: { width: 600, height: 180 },
  full: { width: 800, height: 240 },
}

export function ServiceLogo({ serviceId, size = 'medium', className = '' }: ServiceLogoProps) {
  const logoPath = serviceLogoMap[serviceId.toLowerCase()] || serviceLogoMap['azora-os']
  const dimensions = sizeMap[size]

  return (
    <div className={`relative ${className}`} style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        src={logoPath}
        alt={`${serviceId} logo`}
        fill
        className="object-contain"
        priority={size === 'large' || size === 'full'}
      />
    </div>
  )
}

