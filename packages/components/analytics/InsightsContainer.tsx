/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 📊 INSIGHTS CONTAINER - DIVINE ANALYTICS DASHBOARD
 *
 * Advanced insights and analytics container with living data visualization
 */

'use client';

import {
  Activity,
  BarChart3,
  Brain,
  LineChart,
  PieChart,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Immersive3DCard } from '../immersive/Immersive3DCard';
import { OrganicButton } from '../organism/OrganicButton';

interface InsightMetric {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface InsightsContainerProps {
  title?: string;
  subtitle?: string;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  onTimeframeChange?: (
    timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ) => void;
}

export const InsightsContainer: React.FC<InsightsContainerProps> = ({
  title = 'Divine Insights',
  subtitle = 'Advanced analytics and performance metrics',
  timeframe = 'daily',
  onTimeframeChange,
}) => {
  const [metrics, setMetrics] = useState<InsightMetric[]>([
    {
      id: 'users',
      title: 'Active Users',
      value: '7.8B',
      change: 12.5,
      icon: <Users className="w-6 h-6" />,
      color: '#FFD700',
      trend: 'up',
    },
    {
      id: 'engagement',
      title: 'Engagement Rate',
      value: '84.7%',
      change: 3.2,
      icon: <Activity className="w-6 h-6" />,
      color: '#87CEEB',
      trend: 'up',
    },
    {
      id: 'intelligence',
      title: 'AI Processing',
      value: '2.4T ops',
      change: -1.8,
      icon: <Brain className="w-6 h-6" />,
      color: '#9400D3',
      trend: 'down',
    },
    {
      id: 'performance',
      title: 'System Health',
      value: '99.97%',
      change: 0.0,
      icon: <Zap className="w-6 h-6" />,
      color: '#00FF88',
      trend: 'stable',
    },
  ]);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'detailed' | 'predictions'
  >('overview');

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => {
          // Simulate small fluctuations
          const fluctuation = (Math.random() - 0.5) * 2;
          const newChange = metric.change + fluctuation;

          // Ensure change stays within reasonable bounds
          const boundedChange = Math.max(-20, Math.min(20, newChange));

          return {
            ...metric,
            change: boundedChange,
            trend:
              boundedChange > 0.5
                ? 'up'
                : boundedChange < -0.5
                ? 'down'
                : 'stable',
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const timeframeOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  return (
    <Immersive3DCard
      variant="cosmic"
      depth="extreme"
      float={true}
      tilt={true}
      glow={true}
      className="w-full"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/70 text-sm">{subtitle}</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <span className="text-white/70 text-sm">Timeframe:</span>
          <div className="flex bg-black/30 rounded-full p-1">
            {timeframeOptions.map(option => (
              <button
                key={option.value}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  timeframe === option.value
                    ? 'bg-[#FFD700]/20 text-[#FFD700] font-semibold'
                    : 'text-white/60 hover:text-white/80'
                }`}
                onClick={() =>
                  onTimeframeChange?.(
                    option.value as 'hourly' | 'daily' | 'weekly' | 'monthly'
                  )
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-[#FFD700]/20 pb-4">
        {[
          {
            id: 'overview',
            label: 'Overview',
            icon: <BarChart3 className="w-4 h-4" />,
          },
          {
            id: 'detailed',
            label: 'Detailed',
            icon: <LineChart className="w-4 h-4" />,
          },
          {
            id: 'predictions',
            label: 'Predictions',
            icon: <PieChart className="w-4 h-4" />,
          },
        ].map(tab => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#FFD700]/20 text-[#FFD700] font-semibold'
                : 'text-white/60 hover:text-white/80'
            }`}
            onClick={() =>
              setActiveTab(tab.id as 'overview' | 'detailed' | 'predictions')
            }
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(metric => (
          <Immersive3DCard
            key={metric.id}
            variant="glass"
            depth="medium"
            float={false}
            tilt={true}
            glow={true}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <div
                className="p-3 rounded-full"
                style={{ background: `${metric.color}20` }}
              >
                {metric.icon}
              </div>
            </div>

            <div className="text-2xl font-bold text-white mb-1">
              {metric.value}
            </div>
            <div className="text-white/70 text-sm mb-3">{metric.title}</div>

            <div
              className={`flex items-center justify-center gap-1 text-sm ${
                metric.trend === 'up'
                  ? 'text-green-400'
                  : metric.trend === 'down'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}
            >
              {metric.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : metric.trend === 'down' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>{Math.abs(metric.change).toFixed(1)}%</span>
            </div>
          </Immersive3DCard>
        ))}
      </div>

      {/* Visualization Area */}
      <div className="relative h-64 rounded-2xl bg-gradient-to-br from-black/40 to-[#0a0a1a]/60 border border-[#FFD700]/20 mb-6 overflow-hidden">
        {/* Living Data Visualization */}
        <div className="absolute inset-0">
          {/* Data flow lines */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(15)].map((_, i) => (
              <line
                key={i}
                x1={`${10 + i * 6}%`}
                y1="0"
                x2={`${15 + i * 6}%`}
                y2="100%"
                stroke={`url(#dataGradient${i % 3})`}
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
            <defs>
              <linearGradient
                id="dataGradient0"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <linearGradient
                id="dataGradient1"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#4169E1" />
              </linearGradient>
              <linearGradient
                id="dataGradient2"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#9400D3" />
                <stop offset="100%" stopColor="#4B0082" />
              </linearGradient>
            </defs>
          </svg>

          {/* Data points */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 8 + 2}px`,
                height: `${Math.random() * 8 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background:
                  i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#87CEEB' : '#9400D3',
                opacity: 0.6 + Math.random() * 0.4,
                animation: `pulse ${2 + Math.random() * 3}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Central Analytics Hub */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulsing core */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFD700] via-[#87CEEB] to-[#9400D3] opacity-80 animate-pulse" />

            {/* Orbiting data rings */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full border-2 border-dashed"
                style={{
                  top: '50%',
                  left: '50%',
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  transform: 'translate(-50%, -50%)',
                  borderColor:
                    i === 0 ? '#FFD700' : i === 1 ? '#87CEEB' : '#9400D3',
                  opacity: 0.3,
                  animation: `rotate ${20 + i * 10}s linear infinite reverse`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Overlay text */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center">
            <p className="text-white/80 text-sm mb-1">
              Real-time Data Processing
            </p>
            <p className="text-white/60 text-xs">
              7.8 billion data points analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <OrganicButton variant="divine" size="md" className="px-6 py-3">
          <BarChart3 className="w-5 h-5 mr-2" />
          Detailed Report
        </OrganicButton>

        <OrganicButton variant="cosmic" size="md" className="px-6 py-3">
          <LineChart className="w-5 h-5 mr-2" />
          Export Data
        </OrganicButton>

        <OrganicButton variant="neural" size="md" className="px-6 py-3">
          <Brain className="w-5 h-5 mr-2" />
          AI Insights
        </OrganicButton>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </Immersive3DCard>
  );
};

