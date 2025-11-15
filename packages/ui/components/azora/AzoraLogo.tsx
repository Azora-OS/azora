import type { SVGProps } from 'react'
import { cn } from '../../lib/utils'

interface AzoraLogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'full' | 'icon'
  animated?: boolean
}

/**
 * Azora Gem Tri-Unity Crystal Logo
 * Represents the three pillars: Sapphire (Technology), Emerald (Education), Ruby (Finance)
 */
export function AzoraLogo({ 
  variant = 'icon', 
  animated = false,
  className,
  ...props 
}: AzoraLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'azora-logo',
        animated && 'animate-pulse-sapphire',
        className
      )}
      {...props}
    >
      {/* Sapphire Apex - Technology/AI */}
      <path
        d="M50 10 L70 40 L30 40 Z"
        fill="url(#sapphire-gradient)"
        className="drop-shadow-[0_0_10px_rgba(102,126,234,0.5)]"
      />
      
      {/* Emerald Foundation - Education */}
      <path
        d="M30 40 L50 70 L10 70 Z"
        fill="url(#emerald-gradient)"
        className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
      />
      
      {/* Ruby Core - Finance */}
      <path
        d="M70 40 L90 70 L50 70 Z"
        fill="url(#ruby-gradient)"
        className="drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
      />
      
      {/* Ubuntu Core - Center Unity */}
      <circle
        cx="50"
        cy="55"
        r="8"
        fill="url(#ubuntu-gradient)"
        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="sapphire-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        
        <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        
        <linearGradient id="ruby-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        
        <radialGradient id="ubuntu-gradient">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f4f6" />
        </radialGradient>
      </defs>
    </svg>
  )
}