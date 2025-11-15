import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GradientTextProps {
  children: ReactNode
  variant?: 'sapphire' | 'emerald' | 'ruby' | 'ubuntu' | 'holo'
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

/**
 * GradientText - Text with Azora Gem gradient effects
 */
export function GradientText({ 
  children, 
  variant = 'ubuntu',
  className,
  as: Component = 'span'
}: GradientTextProps) {
  const gradientClass = {
    sapphire: 'gradient-text-sapphire',
    emerald: 'gradient-text-emerald',
    ruby: 'gradient-text-ruby',
    ubuntu: 'gradient-text-ubuntu',
    holo: 'holo-text',
  }[variant]
  
  return (
    <Component className={cn(gradientClass, className)}>
      {children}
    </Component>
  )
}