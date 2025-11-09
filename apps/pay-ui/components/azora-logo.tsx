import React from 'react'

interface AzoraLogoProps {
  className?: string
  variant?: 'primary' | 'white' | 'black'
  size?: number
  showText?: boolean
}

export function AzoraLogo({ 
  className = '', 
  variant = 'primary',
  size = 40,
  showText = false 
}: AzoraLogoProps) {
  const colors = {
    primary: { sapphire: '#3b82f6', emerald: '#14b8a6', ruby: '#f97316' },
    white: { sapphire: '#fff', emerald: '#fff', ruby: '#fff' },
    black: { sapphire: '#000', emerald: '#000', ruby: '#000' },
  }
  
  const c = colors[variant]
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Azora Gem - Tri-Unity Crystal */}
        {/* Sapphire Apex (Technology) */}
        <path d="M50 10 L70 40 L50 35 L30 40 Z" fill={c.sapphire} opacity="0.9" />
        
        {/* Emerald Foundation (Education) */}
        <path d="M30 40 L20 70 L50 75 Z" fill={c.emerald} opacity="0.9" />
        
        {/* Ruby Core (Finance) */}
        <path d="M70 40 L80 70 L50 75 Z" fill={c.ruby} opacity="0.9" />
        
        {/* Unity Core (Constitutional AI) */}
        <circle cx="50" cy="50" r="8" fill="white" opacity="0.8" />
        
        {/* Sankofa Energy Lines */}
        <path d="M50 50 L50 10" stroke={c.sapphire} strokeWidth="1" opacity="0.5" />
        <path d="M50 50 L20 70" stroke={c.emerald} strokeWidth="1" opacity="0.5" />
        <path d="M50 50 L80 70" stroke={c.ruby} strokeWidth="1" opacity="0.5" />
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none">Azora</span>
          <span className="text-xs text-muted-foreground">Ubuntu OS</span>
        </div>
      )}
    </div>
  )
}
