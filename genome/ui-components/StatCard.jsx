/**
 * AZORA PROPRIETARY LICENSE
 *
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

/**
 * StatCard - Display KPI statistics with trend indicators
 * Enhanced with living organism skin concept
 *
 * @param {Object} props - Component props
 * @param {string} props.label - Card label
 * @param {string} props.value - Main value to display
 * @param {string} props.change - Change indicator text
 * @param {React.ReactNode} props.icon - Icon component
 * @param {'up'|'down'|'neutral'} props.trend - Trend direction
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
export function StatCard({ label, value, change, icon, trend = 'neutral', className = '' }) {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-neutral-600 dark:text-neutral-400',
  };

  return (
    <div
      className={`rounded-xl border border-neutral-200/30 bg-white/70 backdrop-blur-xl p-6 shadow-lg shadow-primary-500/5 dark:border-neutral-800/30 dark:bg-neutral-900/70 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 ${className}`}
    >
      {/* Living organism membrane effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.03)_0%,rgba(0,0,0,0)_70%)]"></div>

      {/* Pulse animation */}
      <div className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 border rounded-xl border-primary-500/20 animate-pulse"></div>
      </div>

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className={`mt-1 text-sm font-medium ${trendColors[trend]}`}>{change}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-primary-100/80 to-primary-200/80 p-3 text-primary-600 shadow-inner dark:from-primary-900/80 dark:to-primary-800/80 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
