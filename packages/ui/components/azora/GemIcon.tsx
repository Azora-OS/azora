import type { SVGProps } from 'react'
import { cn } from '../../lib/utils'

interface GemIconProps extends SVGProps<SVGSVGElement> {
  gem: 'sapphire' | 'emerald' | 'ruby'
  glow?: boolean
}

/**
 * Individual Azora Gem Icons
 * Sapphire: Technology/AI
 * Emerald: Education/Growth
 * Ruby: Finance/Value
 */
export function GemIcon({ gem, glow = false, className, ...props }: GemIconProps) {
  const gemConfig = {
    sapphire: {
      gradient: 'url(#sapphire-gem-gradient)',
      glow: 'drop-shadow-[0_0_10px_rgba(102,126,234,0.5)]',
    },
    emerald: {
      gradient: 'url(#emerald-gem-gradient)',
      glow: 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    },
    ruby: {
      gradient: 'url(#ruby-gem-gradient)',
      glow: 'drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    },
  }

  const config = gemConfig[gem]

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('gem-icon', glow && config.glow, className)}
      {...props}
    >
      {/* Gem Shape */}
      <path
        d="M12 2 L20 8 L12 22 L4 8 Z"
        fill={config.gradient}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      
      {/* Facets */}
      <path
        d="M12 2 L12 22"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeOpacity="0.2"
      />
      <path
        d="M4 8 L20 8"
        stroke="currentColor"
        strokeWidth="0.3"
        strokeOpacity="0.2"
      />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="sapphire-gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
        
        <linearGradient id="emerald-gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        
        <linearGradient id="ruby-gem-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
    </svg>
  )
}