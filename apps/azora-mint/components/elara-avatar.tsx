import React from 'react'

interface ElaraAvatarProps {
  variant?: 'core' | 'ide' | 'voice' | 'vision' | 'mind' | 'heart' | 'dreams'
  size?: number
  className?: string
  showName?: boolean
  mood?: 'helpful' | 'thinking' | 'speaking' | 'learning' | 'success' | 'error'
}

const elaraConfig = {
  core: { name: 'Elara', subtitle: 'AI Core', color: 'from-pink-500 via-purple-500 to-blue-500', path: '/packages/public/branding/services/elara-logo.svg' },
  ide: { name: 'Elara IDE', subtitle: 'Code Weaver', color: 'from-cyan-500 via-blue-500 to-purple-500', path: '/packages/public/branding/services/elara-ide-logo.svg' },
  voice: { name: 'Elara Voice', subtitle: 'Speaker', color: 'from-orange-500 via-red-500 to-pink-500', path: '/packages/public/branding/services/elara-voice-logo.svg' },
  vision: { name: 'Elara Vision', subtitle: 'Seer', color: 'from-blue-500 via-cyan-500 to-teal-500', path: '/packages/public/branding/services/elara-vision-logo.svg' },
  mind: { name: 'Elara Mind', subtitle: 'Thinker', color: 'from-indigo-500 via-purple-500 to-pink-500', path: '/packages/public/branding/services/elara-mind-logo.svg' },
  heart: { name: 'Elara Heart', subtitle: 'Empath', color: 'from-rose-500 via-pink-500 to-red-500', path: '/packages/public/branding/services/elara-heart-logo.svg' },
  dreams: { name: 'Elara Dreams', subtitle: 'Creator', color: 'from-violet-500 via-fuchsia-500 to-pink-500', path: '/packages/public/branding/services/elara-dreams-logo.svg' },
}

const moodEffects = {
  helpful: 'animate-pulse',
  thinking: 'animate-spin-slow',
  speaking: 'animate-bounce',
  learning: 'animate-pulse',
  success: 'ring-4 ring-green-500/50',
  error: 'ring-4 ring-red-500/50',
}

export function ElaraAvatar({ variant = 'core', size = 80, className = '', showName = false, mood = 'helpful' }: ElaraAvatarProps) {
  const config = elaraConfig[variant]
  const moodClass = moodEffects[mood] || ''
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div 
        className={`relative rounded-full bg-gradient-to-br ${config.color} p-1 ${moodClass}`}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center p-2">
          <img src={config.path} alt={config.name} className="w-full h-full object-contain" />
        </div>
      </div>
      {showName && (
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{config.name}</div>
          <div className="text-xs text-slate-400">{config.subtitle}</div>
        </div>
      )}
    </div>
  )
}
