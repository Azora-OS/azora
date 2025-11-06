/**
 * AZORA PROPRIETARY LICENSE
 *
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import React from 'react';

/**
 * LivingOrganismCard - A card component that visually represents the living organism concept of Azora OS
 * Features organic animations, pulsing effects, and biometric visualizations
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.status - Status of the organism component
 * @param {number} props.vitality - Vitality level (0-100)
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
export function LivingOrganismCard({ children, title, icon, status = 'active', vitality = 100, className = '' }) {
  const statusColors = {
    active: 'from-green-400 to-emerald-500',
    warning: 'from-yellow-400 to-orange-500',
    critical: 'from-red-400 to-pink-500',
    dormant: 'from-gray-400 to-gray-500',
  };

  const statusPulse = {
    active: 'animate-pulse-slow',
    warning: 'animate-pulse-medium',
    critical: 'animate-pulse-fast',
    dormant: '',
  };

  return (
    <div
      className={`relative rounded-2xl border border-neutral-200/30 bg-white/80 backdrop-blur-xl shadow-xl shadow-primary-500/10 dark:border-neutral-800/30 dark:bg-neutral-900/80 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20 ${className}`}
    >
      {/* Living organism membrane */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>

      {/* Vitality pulse overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${statusColors[status]} opacity-5 ${statusPulse[status]}`}
      ></div>

      {/* Organic vein network */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary-500/20 to-transparent"></div>
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500/20 to-transparent"></div>
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-accent-500/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`rounded-xl bg-gradient-to-br ${statusColors[status]} p-2 text-white shadow-lg`}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${statusColors[status]} text-white`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {/* Vitality indicator */}
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Vitality</span>
            <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden dark:bg-neutral-800">
              <div
                className={`h-full bg-gradient-to-r ${statusColors[status]} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${vitality}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-500">{vitality}%</span>
          </div>
        </div>

        {/* Body */}
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default LivingOrganismCard;
