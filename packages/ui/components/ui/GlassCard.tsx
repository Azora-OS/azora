import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  gem?: 'sapphire' | 'emerald' | 'ruby' | 'default'
  hover?: boolean
}

/**
 * GlassCard - Glassmorphism card with optional gem theming
 */
export function GlassCard({ 
  children, 
  className, 
  gem = 'default',
  hover = false 
}: GlassCardProps) {
  const glassClass = {
    default: 'glass-card',
    sapphire: 'glass-sapphire',
    emerald: 'glass-emerald',
    ruby: 'glass-ruby',
  }[gem]
  
  const hoverClass = hover ? {
    default: 'hover-glow-sapphire',
    sapphire: 'hover-glow-sapphire',
    emerald: 'hover-glow-emerald',
    ruby: 'hover-glow-ruby',
  }[gem] : ''
  
  return (
    <div className={cn(glassClass, hoverClass, 'rounded-lg p-6', className)}>
      {children}
    </div>
  )
}