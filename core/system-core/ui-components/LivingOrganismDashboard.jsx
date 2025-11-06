/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import React from 'react'
import { motion } from 'framer-motion'

/**
 * LivingOrganismDashboard - A dashboard that visualizes the Azora OS as a living organism
 * Shows interconnected systems with vital signs and health indicators
 * 
 * @param {Object} props - Component props
 * @param {Array} props.systems - Array of system objects with name, status, vitality, and components
 * @param {React.ReactNode} props.children - Additional content
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
export function LivingOrganismDashboard({ systems = [], children, className = '' }) {
  // System status colors
  const statusColors = {
    active: 'text-green-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500',
    dormant: 'text-gray-500'
  }

  return (
    <div className={`relative rounded-2xl border border-neutral-200/30 bg-white/80 backdrop-blur-xl p-6 shadow-2xl shadow-primary-500/10 dark:border-neutral-800/30 dark:bg-neutral-900/80 ${className}`}>
      {/* Living organism visualization */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central core */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-xl animate-pulse"></div>
        
        {/* Connecting veins */}
        {systems.map((system, index) => {
          const angle = (index / systems.length) * 2 * Math.PI
          const radius = 150
          const x = 50 + 40 * Math.cos(angle)
          const y = 50 + 40 * Math.sin(angle)
          
          return (
            <div 
              key={system.name}
              className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-b from-primary-500/30 to-transparent origin-top"
              style={{
                transform: `translate(-50%, -100%) rotate(${angle}rad)`,
                transformOrigin: 'center top'
              }}
            ></div>
          )
        })}
      </div>
      
      <div className="relative z-10">
        {/* Dashboard header */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Azora OS - Living Organism Dashboard</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Real-time visualization of the planetary-scale operating system</p>
        </div>
        
        {/* Central nervous system (Elara AI) */}
        <div className="flex justify-center mb-12">
          <motion.div 
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-2xl shadow-primary-500/50 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            <span className="text-white font-bold text-center">ELARA<br/>AI</span>
          </motion.div>
        </div>
        
        {/* System nodes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {systems.map((system, index) => (
            <motion.div
              key={system.name}
              className="rounded-xl border border-neutral-200/30 bg-white/70 p-4 backdrop-blur-lg dark:border-neutral-800/30 dark:bg-neutral-900/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-foreground">{system.name}</h3>
                <span className={`${statusColors[system.status]} font-medium`}>
                  {system.status.toUpperCase()}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600 dark:text-neutral-400">Vitality</span>
                  <span className="font-medium">{system.vitality}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden dark:bg-neutral-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      system.vitality > 80 ? 'bg-green-500' : 
                      system.vitality > 60 ? 'bg-yellow-500' : 
                      system.vitality > 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${system.vitality}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{system.components?.length || 0}</span> components active
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Additional content */}
        {children && (
          <div className="mt-8 pt-6 border-t border-neutral-200/30 dark:border-neutral-800/30">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export default LivingOrganismDashboard