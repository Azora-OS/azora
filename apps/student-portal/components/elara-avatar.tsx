import React from 'react'

interface ElaraAvatarProps {
  variant?: 'core' | 'ide' | 'voice'
  size?: number
  showName?: boolean
  mood?: 'helpful' | 'thinking'
  className?: string
}

export function ElaraAvatar({ variant = 'core', size = 80, showName = false, mood = 'helpful', className = '' }: ElaraAvatarProps) {
  const moodClass = mood === 'helpful' ? 'animate-pulse' : ''
  
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div 
        className={`relative rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-1 ${moodClass}`}
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-3xl">
          🤖
        </div>
      </div>
      {showName && (
        <div className="text-center">
          <div className="text-sm font-semibold text-white">Elara AI</div>
          <div className="text-xs text-slate-400">Your AI Companion</div>
        </div>
      )}
    </div>
  )
}
