import React from 'react'

interface ServiceLogoProps {
  service: string
  size?: number
  className?: string
}

const serviceColors: Record<string, string> = {
  sapiens: 'from-teal-500 to-emerald-500',
  forge: 'from-orange-500 to-red-500',
  mint: 'from-amber-500 to-yellow-500',
  pay: 'from-yellow-500 to-orange-500',
  aegis: 'from-indigo-500 to-purple-500',
  oracle: 'from-violet-500 to-fuchsia-500',
}

export function ServiceLogo({ service, size = 120, className = '' }: ServiceLogoProps) {
  const color = serviceColors[service] || 'from-blue-500 to-purple-500'
  
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${color} p-1 ${className}`} style={{ width: size, height: size }}>
      <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-4xl">
        {service === 'sapiens' && '🎓'}
        {service === 'forge' && '🔨'}
        {service === 'mint' && '💰'}
        {service === 'pay' && '💳'}
        {service === 'aegis' && '🛡️'}
        {service === 'oracle' && '🔮'}
      </div>
    </div>
  )
}
