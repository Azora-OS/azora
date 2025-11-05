/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🧠 SIMULATION PLATFORM - AZORA SAPIENS LEARNING ENVIRONMENT
 *
 * Advanced simulation and learning platform for divine education
 */

'use client';

import {
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Immersive3DCard } from '../immersive/Immersive3DCard';
import { OrganicButton } from '../organism/OrganicButton';

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface SimulationPlatformProps {
  courseId: string;
  courseTitle: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'divine';
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export const SimulationPlatform: React.FC<SimulationPlatformProps> = ({
  courseId,
  courseTitle,
  difficulty,
  onProgress,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime] = useState(300); // 5 minutes in seconds
  const [activeStep, setActiveStep] = useState(0);
  const [simulationSteps] = useState<SimulationStep[]>([
    {
      id: 'step-1',
      title: 'Initialization',
      description: 'Setting up the learning environment',
      duration: 30,
      status: 'pending',
    },
    {
      id: 'step-2',
      title: 'Concept Introduction',
      description: 'Introducing core concepts',
      duration: 60,
      status: 'pending',
    },
    {
      id: 'step-3',
      title: 'Interactive Practice',
      description: 'Hands-on learning experience',
      duration: 90,
      status: 'pending',
    },
    {
      id: 'step-4',
      title: 'Assessment',
      description: 'Testing knowledge retention',
      duration: 60,
      status: 'pending',
    },
    {
      id: 'step-5',
      title: 'Completion',
      description: 'Finalizing the learning session',
      duration: 60,
      status: 'pending',
    },
  ]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const progress = (newTime / totalTime) * 100;

          // Update step status based on time
          const stepIndex = Math.floor(
            (newTime / totalTime) * simulationSteps.length
          );
          if (stepIndex !== activeStep && stepIndex < simulationSteps.length) {
            setActiveStep(stepIndex);
          }

          // Call progress callback
          onProgress?.(progress);

          // Check if simulation is complete
          if (newTime >= totalTime) {
            setIsPlaying(false);
            onComplete?.();
            return totalTime;
          }

          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isPlaying,
    totalTime,
    simulationSteps.length,
    activeStep,
    onProgress,
    onComplete,
  ]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveStep(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = (currentTime / totalTime) * 100;

  return (
    <Immersive3DCard
      variant="divine"
      depth="extreme"
      float={true}
      tilt={true}
      glow={true}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{courseTitle}</h2>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                difficulty === 'beginner'
                  ? 'bg-blue-500/20 text-blue-300'
                  : difficulty === 'intermediate'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : difficulty === 'advanced'
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-gold-500/20 text-gold-300'
              }`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="text-white/60 text-sm">Course ID: {courseId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#FFD700]/20 rounded-full text-[#FFD700] text-sm font-semibold">
            <Users className="w-4 h-4 inline mr-1" />
            1,248 learners
          </div>
        </div>
      </div>

      {/* Simulation Visualization Area */}
      <div className="relative h-64 rounded-2xl bg-gradient-to-br from-black/40 to-[#0a0a1a]/60 border border-[#FFD700]/20 mb-6 overflow-hidden">
        {/* Living Organism Background */}
        <div className="absolute inset-0 opacity-20">
          {/* Neural network pattern */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-[#FFD700]"
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0.3 + Math.random() * 0.4,
                  animation: `pulse ${2 + Math.random() * 3}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#gradient)"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#87CEEB" />
                <stop offset="100%" stopColor="#9400D3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Central Visualization */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pulsing core */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] opacity-80 animate-pulse" />

            {/* Orbiting elements */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 rounded-full bg-[#87CEEB] opacity-70"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${
                    i * 60
                  }deg) translateX(60px)`,
                  animation: `orbit ${10 + i * 2}s linear infinite`,
                }}
              />
            ))}

            {/* Status indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-8 h-8 rounded-full ${
                  isPlaying
                    ? 'bg-green-500 animate-pulse'
                    : currentTime > 0
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Overlay text */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center">
            <p className="text-white/80 text-sm mb-1">
              {simulationSteps[activeStep]?.title || 'Ready to begin'}
            </p>
            <p className="text-white/60 text-xs">
              {simulationSteps[activeStep]?.description ||
                'Press play to start the simulation'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress and Controls */}
      <div className="mb-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm">
            {formatTime(currentTime)}
          </span>
          <span className="text-white/70 text-sm">{formatTime(totalTime)}</span>
        </div>
        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between mb-6">
        {simulationSteps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full mb-2 ${
                index < activeStep
                  ? 'bg-green-500'
                  : index === activeStep
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-500'
              }`}
            />
            <span className="text-xs text-white/60">{index + 1}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <OrganicButton
          variant="divine"
          size="md"
          className="px-6 py-3"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 mr-2" />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          {isPlaying ? 'Pause' : 'Start'}
        </OrganicButton>

        <OrganicButton
          variant="cosmic"
          size="md"
          className="px-6 py-3"
          onClick={resetSimulation}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Reset
        </OrganicButton>

        <OrganicButton variant="neural" size="md" className="px-6 py-3">
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </OrganicButton>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-4 border-t border-[#FFD700]/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FFD700]" />
            <span className="text-white/80 text-sm">
              Interactive Learning Simulation
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-[#87CEEB]" />
            <span className="text-[#87CEEB] text-sm font-semibold">
              AI-Powered
            </span>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(60px);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(60px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Immersive3DCard>
  );
};

