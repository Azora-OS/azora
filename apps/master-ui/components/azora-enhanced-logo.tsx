"use client"

import { AzoraLogo } from '@azora/branding'

interface AzoraEnhancedLogoProps {
  className?: string
  showTagline?: boolean
}

export function AzoraEnhancedLogo({ className = "h-10 w-10", showTagline = false }: AzoraEnhancedLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <AzoraLogo variant="primary" size="md" animated />
      {showTagline && (
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground">Azora OS</span>
          <span className="text-xs text-muted-foreground">Constitutional AI</span>
        </div>
      )}
    </div>
  )
}