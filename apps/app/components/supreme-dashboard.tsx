/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SystemMetric {
  label: string;
  value: string;
  status: 'online' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

const SYSTEM_METRICS: SystemMetric[] = [
  { label: 'Services Online', value: '190/190', status: 'online', trend: 'stable' },
  { label: 'Active Users', value: '2.4M', status: 'online', trend: 'up' },
  { label: 'Transactions/sec', value: '15.2K', status: 'online', trend: 'up' },
  { label: 'System Health', value: '99.9%', status: 'online', trend: 'stable' },
  { label: 'Neural Load', value: '67%', status: 'warning', trend: 'stable' },
  { label: 'Revenue Today', value: '$847K', status: 'online', trend: 'up' }
];

const QUICK_ACTIONS = [
  { title: 'Education Portal', icon: '🎓', color: 'from-blue-500 to-cyan-500' },
  { title: 'Mint Dashboard', icon: '💰', color: 'from-green-500 to-emerald-500' },
  { title: 'Forge Marketplace', icon: '🔨', color: 'from-purple-500 to-pink-500' },
  { title: 'System Monitor', icon: '📊', color: 'from-orange-500 to-red-500' }
];

export function SupremeDashboard() {
  return (
    <div className="min-h-screen neural-bg p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold holo-text mb-2">
          Azora OS Command Center
        </h1>
        <p className="text-gray-600 text-lg">
          The World's First Constitutional AI Operating System
        </p>
      </motion.div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {SYSTEM_METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
              <div className={`status-${metric.status === 'online' ? 'online' : 'warning'}`} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
              <span className={`text-sm ${
                metric.trend === 'up' ? 'text-green-500' : 
                metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {metric.trend === 'up' ? '↗️' : metric.trend === 'down' ? '↘️' : '→'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action, index) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`glass-card p-6 text-left hover:shadow-xl transition-all bg-gradient-to-br ${action.color}`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-white font-semibold">{action.title}</h3>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Live Activity Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-6"
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">Live System Activity</h2>
        <div className="space-y-3">
          {[
            { time: '14:32', event: 'New student enrolled in Azora University', type: 'education' },
            { time: '14:31', event: '$2,450 transaction processed via Mint', type: 'finance' },
            { time: '14:30', event: 'Freelancer completed gig on Forge', type: 'marketplace' },
            { time: '14:29', event: 'Constitutional AI approved 47 transactions', type: 'system' },
            { time: '14:28', event: 'Quantum computation completed successfully', type: 'quantum' }
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 rounded-lg bg-white/50"
            >
              <span className="text-sm text-gray-500 font-mono">{activity.time}</span>
              <span className="text-sm text-gray-700">{activity.event}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                activity.type === 'education' ? 'bg-blue-100 text-blue-700' :
                activity.type === 'finance' ? 'bg-green-100 text-green-700' :
                activity.type === 'marketplace' ? 'bg-purple-100 text-purple-700' :
                activity.type === 'quantum' ? 'bg-pink-100 text-pink-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {activity.type}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        className="fab flex items-center justify-center text-white text-xl"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        ⚡
      </motion.button>
    </div>
  );
}