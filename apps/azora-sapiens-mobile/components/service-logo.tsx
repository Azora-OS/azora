import React from 'react'

interface ServiceLogoProps {
  service: 'sapiens' | 'forge' | 'mint' | 'pay' | 'aegis' | 'oracle' | 'nexus' | 'synapse' | 'covenant' | 'workspace' | 'careers' | 'classroom' | 'community' | 'education' | 'innovation-hub' | 'library' | 'mint-mine' | 'research-center' | 'scriptorium' | 'student-life'
  size?: number
  className?: string
  showName?: boolean
}

const serviceConfig = {
  sapiens: { name: 'Azora Sapiens', color: 'from-teal-500 to-emerald-500', path: '/packages/public/branding/services/azora-sapiens-logo.svg' },
  forge: { name: 'Azora Forge', color: 'from-orange-500 to-red-500', path: '/packages/public/branding/services/azora-forge-logo.svg' },
  mint: { name: 'Azora Mint', color: 'from-amber-500 to-yellow-500', path: '/packages/public/branding/services/azora-mint-logo.svg' },
  pay: { name: 'Azora Pay', color: 'from-yellow-500 to-orange-500', path: '/packages/public/branding/services/azora-pay-logo.svg' },
  aegis: { name: 'Azora Aegis', color: 'from-indigo-500 to-purple-500', path: '/packages/public/branding/services/azora-aegis-logo.svg' },
  oracle: { name: 'Azora Oracle', color: 'from-violet-500 to-fuchsia-500', path: '/packages/public/branding/services/azora-oracle-logo.svg' },
  nexus: { name: 'Azora Nexus', color: 'from-cyan-500 to-blue-500', path: '/packages/public/branding/services/azora-nexus-logo.svg' },
  synapse: { name: 'Azora Synapse', color: 'from-blue-500 to-indigo-500', path: '/packages/public/branding/services/azora-synapse-logo.svg' },
  covenant: { name: 'Azora Covenant', color: 'from-purple-500 to-indigo-500', path: '/packages/public/branding/services/azora-covenant-logo.svg' },
  workspace: { name: 'Azora Workspace', color: 'from-lime-500 to-green-500', path: '/packages/public/branding/services/azora-workspace-logo.svg' },
  careers: { name: 'Azora Careers', color: 'from-green-500 to-emerald-500', path: '/packages/public/branding/services/azora-careers-logo.svg' },
  classroom: { name: 'Azora Classroom', color: 'from-teal-500 to-cyan-500', path: '/packages/public/branding/services/azora-classroom-logo.svg' },
  community: { name: 'Azora Community', color: 'from-orange-500 to-amber-500', path: '/packages/public/branding/services/azora-community-logo.svg' },
  education: { name: 'Azora Education', color: 'from-emerald-500 to-teal-500', path: '/packages/public/branding/services/azora-education-logo.svg' },
  'innovation-hub': { name: 'Innovation Hub', color: 'from-pink-500 to-rose-500', path: '/packages/public/branding/services/azora-innovation-hub-logo.svg' },
  library: { name: 'Azora Library', color: 'from-blue-500 to-cyan-500', path: '/packages/public/branding/services/azora-library-logo.svg' },
  'mint-mine': { name: 'Mint & Mine', color: 'from-yellow-500 to-amber-500', path: '/packages/public/branding/services/azora-mint-mine-logo.svg' },
  'research-center': { name: 'Research Center', color: 'from-indigo-500 to-blue-500', path: '/packages/public/branding/services/azora-research-center-logo.svg' },
  scriptorium: { name: 'Azora Scriptorium', color: 'from-purple-500 to-pink-500', path: '/packages/public/branding/services/azora-scriptorium-logo.svg' },
  'student-life': { name: 'Student Life', color: 'from-rose-500 to-pink-500', path: '/packages/public/branding/services/azora-student-life-logo.svg' },
}

export function ServiceLogo({ service, size = 200, className = '', showName = false }: ServiceLogoProps) {
  const config = serviceConfig[service]
  
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`relative rounded-2xl bg-gradient-to-br ${config.color} p-1`} style={{ width: size, height: size }}>
        <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center p-4">
          <img src={config.path} alt={config.name} className="w-full h-full object-contain" />
        </div>
      </div>
      {showName && (
        <span className="text-lg font-semibold text-white">{config.name}</span>
      )}
    </div>
  )
}
