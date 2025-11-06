/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import { useState, useEffect } from 'react';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  perplexity: number;
  accuracy: number;
  learningRate: number;
}

export function LLMTrainingDashboard() {
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
  const [modelSize, setModelSize] = useState('small');

  const modelConfigs = {
    small: { epochs: 10, parameters: '12M', description: 'Quick learning prototype' },
    medium: { epochs: 20, parameters: '84M', description: 'Balanced performance' },
    large: { epochs: 50, parameters: '300M', description: 'Maximum capability' },
  };

  useEffect(() => {
    // Initialize with some historical data
    const initialMetrics: TrainingMetrics[] = [
      { epoch: 0, loss: 4.5, perplexity: 90.0, accuracy: 0.15, learningRate: 0.0003 },
      { epoch: 1, loss: 3.8, perplexity: 44.7, accuracy: 0.28, learningRate: 0.0003 },
      { epoch: 2, loss: 3.2, perplexity: 24.5, accuracy: 0.42, learningRate: 0.0003 },
      { epoch: 3, loss: 2.7, perplexity: 14.9, accuracy: 0.55, learningRate: 0.0002 },
    ];
    setMetrics(initialMetrics);
    setCurrentEpoch(3);
  }, []);

  const startTraining = async () => {
    setIsTraining(true);
    const config = modelConfigs[modelSize as keyof typeof modelConfigs];
    
    for (let epoch = currentEpoch + 1; epoch <= config.epochs; epoch++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMetric: TrainingMetrics = {
        epoch,
        loss: Math.max(0.5, 4.5 * Math.exp(-epoch * 0.15) + Math.random() * 0.2),
        perplexity: Math.max(2, Math.exp(4.5 * Math.exp(-epoch * 0.15) + Math.random() * 0.2)),
        accuracy: Math.min(0.95, 0.15 + epoch * 0.03 + Math.random() * 0.05),
        learningRate: 0.0003 * Math.exp(-epoch * 0.05),
      };
      
      setMetrics(prev => [...prev, newMetric]);
      setCurrentEpoch(epoch);
    }
    
    setIsTraining(false);
  };

  const stopTraining = () => {
    setIsTraining(false);
  };

  const resetTraining = () => {
    setIsTraining(false);
    setCurrentEpoch(0);
    setMetrics([]);
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* Training Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-white text-sm">Model Size:</label>
          <select 
            value={modelSize} 
            onChange={(e) => setModelSize(e.target.value)}
            disabled={isTraining}
            className="bg-black/40 border border-white/20 rounded px-3 py-1 text-white text-sm disabled:opacity-50"
          >
            <option value="small">Small (12M)</option>
            <option value="medium">Medium (84M)</option>
            <option value="large">Large (300M)</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          {!isTraining ? (
            <button
              onClick={startTraining}
              className="px-4 py-2 bg-gradient-to-r from-[#00FF88]/20 to-[#00AA66]/20 border border-[#00FF88]/30 rounded-lg text-white text-sm hover:from-[#00FF88]/30 hover:to-[#00AA66]/30 transition-all"
            >
              🧠 Start Training
            </button>
          ) : (
            <button
              onClick={stopTraining}
              className="px-4 py-2 bg-gradient-to-r from-[#FF6347]/20 to-[#DC143C]/20 border border-[#FF6347]/30 rounded-lg text-white text-sm hover:from-[#FF6347]/30 hover:to-[#DC143C]/30 transition-all"
            >
              ⏸️ Stop Training
            </button>
          )}
          
          <button
            onClick={resetTraining}
            disabled={isTraining}
            className="px-4 py-2 bg-gradient-to-r from-[#87CEEB]/20 to-[#00D9FF]/20 border border-[#87CEEB]/30 rounded-lg text-white text-sm hover:from-[#87CEEB]/30 hover:to-[#00D9FF]/30 transition-all disabled:opacity-50"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#FFD700] mb-1">
            {currentEpoch}/{modelConfigs[modelSize as keyof typeof modelConfigs].epochs}
          </div>
          <div className="text-xs text-white/60">Current Epoch</div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#87CEEB] mb-1">
            {latestMetrics?.loss.toFixed(3) || '0.000'}
          </div>
          <div className="text-xs text-white/60">Training Loss</div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#9400D3] mb-1">
            {latestMetrics?.perplexity.toFixed(1) || '0.0'}
          </div>
          <div className="text-xs text-white/60">Perplexity</div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#00FF88] mb-1">
            {((latestMetrics?.accuracy || 0) * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-white/60">Accuracy</div>
        </div>
      </div>

      {/* Training Progress */}
      <div className="bg-black/40 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-white">Training Progress</h4>
          <span className="text-sm text-white/60">
            {isTraining ? '🧠 Training in progress...' : '⏸️ Training paused'}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${(currentEpoch / modelConfigs[modelSize as keyof typeof modelConfigs].epochs) * 100}%` 
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>Epoch {currentEpoch}</span>
          <span>{Math.round((currentEpoch / modelConfigs[modelSize as keyof typeof modelConfigs].epochs) * 100)}%</span>
        </div>
      </div>

      {/* Metrics Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loss Chart */}
        <div className="bg-black/40 rounded-lg p-4">
          <h4 className="font-bold text-[#87CEEB] mb-3">📉 Training Loss</h4>
          <div className="h-32 flex items-end justify-between gap-1">
            {metrics.slice(-10).map((metric, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#87CEEB] to-[#00D9FF] rounded-t relative group">
                <div 
                  className="w-full transition-all duration-500"
                  style={{ height: `${(metric.loss / 5) * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {metric.loss.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="bg-black/40 rounded-lg p-4">
          <h4 className="font-bold text-[#00FF88] mb-3">📈 Accuracy</h4>
          <div className="h-32 flex items-end justify-between gap-1">
            {metrics.slice(-10).map((metric, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-[#00FF88] to-[#00AA66] rounded-t relative group">
                <div 
                  className="w-full transition-all duration-500"
                  style={{ height: `${metric.accuracy * 100}%` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {(metric.accuracy * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-black/40 rounded-lg p-4">
        <h4 className="font-bold text-[#FFD700] mb-3">🏗️ Model Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-white/60">Parameters:</span>
            <span className="ml-2 text-white">{modelConfigs[modelSize as keyof typeof modelConfigs].parameters}</span>
          </div>
          <div>
            <span className="text-white/60">Total Epochs:</span>
            <span className="ml-2 text-white">{modelConfigs[modelSize as keyof typeof modelConfigs].epochs}</span>
          </div>
          <div>
            <span className="text-white/60">Description:</span>
            <span className="ml-2 text-white">{modelConfigs[modelSize as keyof typeof modelConfigs].description}</span>
          </div>
        </div>
      </div>

      {/* Training Log */}
      <div className="bg-black/40 rounded-lg p-4">
        <h4 className="font-bold text-[#9400D3] mb-3">📜 Training Log</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {metrics.slice(-5).reverse().map((metric, i) => (
            <div key={i} className="text-xs text-white/80 font-mono">
              Epoch {metric.epoch}: Loss={metric.loss.toFixed(4)} | Perplexity={metric.perplexity.toFixed(2)} | Accuracy={((metric.accuracy) * 100).toFixed(2)}% | LR={metric.learningRate.toFixed(6)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

