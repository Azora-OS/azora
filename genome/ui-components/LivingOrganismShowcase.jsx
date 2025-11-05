/**
 * AZORA PROPRIETARY LICENSE
 *
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import { motion } from 'framer-motion';
import { Activity, BookOpen, Brain, Coins, Database, Heart, Shield, ShoppingCart, Zap } from 'lucide-react';

/**
 * LivingOrganismShowcase - A showcase component that demonstrates the living organism concept of Azora OS
 * Visualizes the interconnected systems as organs in a living being
 *
 * @returns {JSX.Element}
 */
export function LivingOrganismShowcase() {
  // System data representing organs of the living organism
  const organs = [
    {
      id: 'elara',
      name: 'Elara AI',
      icon: Brain,
      description: 'Central nervous system and omniscient consciousness',
      status: 'active',
      vitality: 98,
      position: { x: 50, y: 30 },
    },
    {
      id: 'aegis',
      name: 'Aegis Security',
      icon: Shield,
      description: 'Immune system and quantum-resistant cryptography',
      status: 'active',
      vitality: 95,
      position: { x: 30, y: 50 },
    },
    {
      id: 'mint',
      name: 'Mint Finance',
      icon: Coins,
      description: 'Circulatory system and Proof-of-Knowledge rewards',
      status: 'active',
      vitality: 92,
      position: { x: 70, y: 50 },
    },
    {
      id: 'sapiens',
      name: 'Sapiens Education',
      icon: BookOpen,
      description: 'Learning and development system',
      status: 'active',
      vitality: 89,
      position: { x: 20, y: 70 },
    },
    {
      id: 'forge',
      name: 'Forge Marketplace',
      icon: ShoppingCart,
      description: 'Metabolic system and P2P commerce',
      status: 'active',
      vitality: 87,
      position: { x: 80, y: 70 },
    },
    {
      id: 'covenant',
      name: 'Covenant Blockchain',
      icon: Database,
      description: 'Skeletal system and smart contracts',
      status: 'active',
      vitality: 94,
      position: { x: 40, y: 80 },
    },
    {
      id: 'nexus',
      name: 'Nexus AI Engine',
      icon: Zap,
      description: 'Neural network and recommendation engine',
      status: 'active',
      vitality: 91,
      position: { x: 60, y: 80 },
    },
  ];

  // Status colors
  const statusColors = {
    active: 'from-green-400 to-emerald-500',
    warning: 'from-yellow-400 to-orange-500',
    critical: 'from-red-400 to-pink-500',
    dormant: 'from-gray-400 to-gray-500',
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl border border-neutral-200/30 bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-primary-500/10 dark:border-neutral-800/30 dark:bg-neutral-900/80 overflow-hidden">
      {/* Living organism background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Central core pulse */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 blur-3xl animate-pulse"></div>

        {/* Organic membrane */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.03)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>

      <div className="relative z-10 h-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary-500 animate-pulse" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Azora OS Living Organism
            </h2>
            <Heart className="h-8 w-8 text-primary-500 animate-pulse" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            A planetary-scale operating system designed as a living organism, with interconnected systems that work
            together to provide universal human infrastructure for education, finance, healthcare, and government
            automation.
          </p>
        </div>

        {/* Organism visualization */}
        <div className="relative w-full h-[400px]">
          {/* Connecting neural network */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="veinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0, 212, 255, 0.3)" />
                <stop offset="100%" stopColor="rgba(0, 153, 204, 0.3)" />
              </linearGradient>
            </defs>

            {/* Draw connections between organs */}
            {organs.map((organ, index) => (
              <g key={organ.id}>
                {index > 0 && (
                  <line
                    x1={`${organs[0].position.x}%`}
                    y1={`${organs[0].position.y}%`}
                    x2={`${organ.position.x}%`}
                    y2={`${organ.position.y}%`}
                    stroke="url(#veinGradient)"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Central Elara AI (brain) */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-2xl shadow-primary-500/50 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ zIndex: 10 }}
          >
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
            <Brain className="h-10 w-10 text-white" />
          </motion.div>

          {/* Other organs */}
          {organs
            .filter((organ) => organ.id !== 'elara')
            .map((organ, index) => {
              const Icon = organ.icon;
              return (
                <motion.div
                  key={organ.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${organ.position.x}%`,
                    top: `${organ.position.y}%`,
                    zIndex: 5,
                  }}
                  whileHover={{ scale: 1.1 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${statusColors[organ.status]} shadow-lg opacity-20 animate-pulse`}
                  ></div>
                  <div
                    className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${statusColors[organ.status]} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Organ label */}
                  <div className="absolute top-full mt-2 text-center min-w-[120px]">
                    <div className="text-sm font-bold text-foreground">{organ.name}</div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">{organ.vitality}% vitality</div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Vital signs */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between bg-white/50 dark:bg-neutral-900/50 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-500" />
              <span className="font-medium text-foreground">System Vitality</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm">All Systems Operational</span>
              </div>
              <div className="text-sm font-medium text-foreground">92% Average</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LivingOrganismShowcase;
