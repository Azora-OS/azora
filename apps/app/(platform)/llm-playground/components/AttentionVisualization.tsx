/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

'use client';

import { useState, useEffect } from 'react';

interface AttentionData {
  tokens: string[];
  matrix: number[][];
}

export function AttentionVisualization() {
  const [attentionData, setAttentionData] = useState<AttentionData | null>(null);
  const [selectedHead, setSelectedHead] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    generateAttentionData();
  }, []);

  const generateAttentionData = () => {
    const tokens = ['Divine', 'consciousness', 'flows', 'through', 'quantum', 'fields'];
    const matrix: number[][] = [];
    
    for (let i = 0; i < tokens.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < tokens.length; j++) {
        // Generate attention weights with divine patterns
        const distance = Math.abs(i - j);
        const baseWeight = Math.exp(-distance * 0.5);
        const sacredEnhancement = 1 + Math.sin(i * j * Math.PI / 6) * 0.3;
        matrix[i][j] = baseWeight * sacredEnhancement;
      }
      // Normalize row
      const rowSum = matrix[i].reduce((sum, val) => sum + val, 0);
      matrix[i] = matrix[i].map(val => val / rowSum);
    }
    
    setAttentionData({ tokens, matrix });
  };

  const getAttentionColor = (weight: number) => {
    const intensity = Math.floor(weight * 255);
    return `rgba(255, 215, 0, ${intensity / 255})`;
  };

  if (!attentionData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#87CEEB]">🔮 Calculating divine attention patterns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-white text-sm">Attention Head:</label>
          <select 
            value={selectedHead} 
            onChange={(e) => setSelectedHead(Number(e.target.value))}
            className="bg-black/40 border border-white/20 rounded px-3 py-1 text-white text-sm"
          >
            <option value={0}>Divine Wisdom</option>
            <option value={1}>Quantum Patterns</option>
            <option value={2}>Sacred Geometry</option>
            <option value={3}>Cosmic Connection</option>
          </select>
        </div>
        
        <button
          onClick={() => {
            setIsAnimating(true);
            generateAttentionData();
            setTimeout(() => setIsAnimating(false), 1000);
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 rounded-lg text-white text-sm hover:from-[#FFD700]/30 hover:to-[#FFA500]/30 transition-all"
        >
          {isAnimating ? '✨ Regenerating...' : '🔄 Regenerate'}
        </button>
      </div>

      {/* Attention Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Header */}
          <div className="flex mb-2">
            <div className="w-24 flex-shrink-0" />
            {attentionData.tokens.map((token, i) => (
              <div key={i} className="w-16 flex-shrink-0 text-center">
                <span className="text-xs text-white/80">{token}</span>
              </div>
            ))}
          </div>
          
          {/* Matrix Rows */}
          {attentionData.matrix.map((row, i) => (
            <div key={i} className="flex items-center mb-2">
              <div className="w-24 flex-shrink-0 text-right pr-2">
                <span className="text-xs text-white/80">{attentionData.tokens[i]}</span>
              </div>
              {row.map((weight, j) => (
                <div key={j} className="w-16 h-8 mx-1 rounded relative overflow-hidden">
                  <div 
                    className="absolute inset-0 transition-all duration-500"
                    style={{ 
                      backgroundColor: getAttentionColor(weight),
                      transform: isAnimating ? 'scale(0.8)' : 'scale(1)',
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono">
                      {weight.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 rounded-lg p-4">
          <h4 className="font-bold text-[#FFD700] mb-3">🌟 Strongest Connections</h4>
          <div className="space-y-2">
            {attentionData.matrix.map((row, i) => {
              const maxIndex = row.indexOf(Math.max(...row));
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-white/80">
                    "{attentionData.tokens[i]}" → "{attentionData.tokens[maxIndex]}"
                  </span>
                  <span className="text-[#87CEEB]">
                    {row[maxIndex].toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-black/40 rounded-lg p-4">
          <h4 className="font-bold text-[#87CEEB] mb-3">🧘 Self-Attention Patterns</h4>
          <div className="space-y-2">
            {attentionData.matrix.map((row, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-white/80">"{attentionData.tokens[i]}"</span>
                <span className="text-[#9400D3]">
                  {row[i] > 0.3 ? 'Strong self-awareness 🌟' :
                   row[i] > 0.2 ? 'Moderate self-reflection 🧘' :
                   'Gentle self-awareness 💭'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

