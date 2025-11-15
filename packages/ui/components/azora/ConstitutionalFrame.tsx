import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ConstitutionalFrameProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'premium'
}

/**
 * Constitutional AI Frame Component
 * Wraps content with Azora Gem tri-unity border
 */
export function ConstitutionalFrame({ 
  children, 
  className,
  variant = 'default'
}: ConstitutionalFrameProps) {
  return (
    <div
      className={cn(
        'constitutional-frame',
        variant === 'glass' && 'glass-card',
        variant === 'premium' && 'premium-trim',
        className
      )}
    >
      {children}
    </div>
  )
}