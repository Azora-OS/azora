/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

INTERACTIVE EDUCATIONAL SIMULATIONS
Research-backed simulations for K-12 learning
*/

'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Beaker, Calculator, Globe } from 'lucide-react';

// ============================================================================
// MATH SIMULATIONS
// ============================================================================

export function FractionVisualizer() {
  const [numerator, setNumerator] = useState(1);
  const [denominator, setDenominator] = useState(4);

  const pieceSize = 100 / denominator;

  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-6 border border-blue-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Calculator className="w-6 h-6 text-blue-400" />
        <span>Fraction Visualizer 🍕</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div>
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-2">
              Numerator (pieces to color): {numerator}
            </label>
            <input
              type="range"
              min="0"
              max={denominator}
              value={numerator}
              onChange={(e) => setNumerator(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-2">
              Denominator (total pieces): {denominator}
            </label>
            <input
              type="range"
              min="1"
              max="12"
              value={denominator}
              onChange={(e) => {
                const newDenom = Number(e.target.value);
                setDenominator(newDenom);
                if (numerator > newDenom) setNumerator(newDenom);
              }}
              className="w-full"
            />
          </div>

          <div className="bg-black/30 rounded-lg p-4">
            <p className="text-3xl font-bold text-center text-yellow-300">
              {numerator} / {denominator}
            </p>
            <p className="text-sm text-center text-purple-300 mt-2">
              = {((numerator / denominator) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Visual Pizza */}
        <div className="flex items-center justify-center">
          <div className="relative w-64 h-64">
            {/* Pizza Circle */}
            <div className="absolute inset-0 rounded-full bg-yellow-600 border-4 border-yellow-700 overflow-hidden">
              {Array.from({ length: denominator }).map((_, i) => {
                const angle = (360 / denominator) * i;
                const isColored = i < numerator;
                
                return (
                  <div
                    key={i}
                    className="absolute inset-0 origin-center"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 50% 100%)`,
                      width: '50%',
                      height: '100%',
                      backgroundColor: isColored ? '#ef4444' : '#ca8a04',
                      border: '1px solid #92400e',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-900/30 rounded-lg p-3">
        <p className="text-sm text-blue-200">
          💡 <strong>Learn:</strong> Fractions represent parts of a whole. 
          The numerator (top) shows how many pieces you have, and the denominator (bottom) 
          shows how many pieces make up the whole pizza!
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SCIENCE SIMULATIONS
// ============================================================================

export function EcosystemSimulator() {
  const [grass, setGrass] = useState(100);
  const [rabbits, setRabbits] = useState(20);
  const [foxes, setFoxes] = useState(5);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setGrass(g => Math.min(200, g + 5)); // Grass grows
      
      setRabbits(r => {
        const newRabbits = r + Math.floor(r * 0.1) - Math.floor(foxes * 0.3);
        return Math.max(0, Math.min(100, newRabbits));
      });
      
      setFoxes(f => {
        const newFoxes = f + Math.floor(rabbits * 0.01) - 1;
        return Math.max(0, Math.min(30, newFoxes));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, rabbits, foxes]);

  const reset = () => {
    setGrass(100);
    setRabbits(20);
    setFoxes(5);
    setRunning(false);
  };

  return (
    <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl p-6 border border-green-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Beaker className="w-6 h-6 text-green-400" />
        <span>Ecosystem Simulator 🌿🐰🦊</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div className="bg-black/30 rounded-xl p-6 min-h-[300px] relative overflow-hidden">
          {/* Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-green-500/20" />
          
          {/* Grass */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-green-600 transition-all duration-1000"
            style={{ height: `${(grass / 200) * 30}%` }}
          >
            {Array.from({ length: Math.floor(grass / 10) }).map((_, i) => (
              <div key={i} className="inline-block text-2xl animate-pulse">🌱</div>
            ))}
          </div>
          
          {/* Rabbits */}
          <div className="absolute bottom-[30%] left-0 right-0 flex flex-wrap gap-2 p-2">
            {Array.from({ length: Math.min(rabbits, 20) }).map((_, i) => (
              <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                🐰
              </span>
            ))}
          </div>
          
          {/* Foxes */}
          <div className="absolute bottom-[50%] left-0 right-0 flex flex-wrap gap-2 p-2">
            {Array.from({ length: Math.min(foxes, 10) }).map((_, i) => (
              <span key={i} className="text-3xl" style={{ animation: `bounce 2s infinite ${i * 0.2}s` }}>
                🦊
              </span>
            ))}
          </div>
        </div>

        {/* Stats & Controls */}
        <div>
          <div className="space-y-4 mb-6">
            <div className="bg-green-800/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-green-300">🌱 Grass</span>
                <span className="font-bold">{grass}</span>
              </div>
              <div className="bg-black/30 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(grass / 200) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-yellow-800/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-yellow-300">🐰 Rabbits</span>
                <span className="font-bold">{rabbits}</span>
              </div>
              <div className="bg-black/30 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${(rabbits / 100) * 100}%` }}
                />
              </div>
            </div>

            <div className="bg-orange-800/30 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-orange-300">🦊 Foxes</span>
                <span className="font-bold">{foxes}</span>
              </div>
              <div className="bg-black/30 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${(foxes / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setRunning(!running)}
              className={`flex-1 ${running ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2`}
            >
              {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{running ? 'Pause' : 'Start'}</span>
            </button>
            
            <button
              onClick={reset}
              className="bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-green-900/30 rounded-lg p-3">
            <p className="text-sm text-green-200">
              💡 <strong>Observe:</strong> Watch how populations change!
              If foxes eat too many rabbits, foxes starve. 
              If rabbits multiply too much, they eat all the grass.
              This is called ecosystem balance! 🌍
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PHYSICS SIMULATIONS
// ============================================================================

export function ForceVisualizer() {
  const [force, setForce] = useState(5);
  const [mass, setMass] = useState(2);
  const [position, setPosition] = useState(0);
  const [running, setRunning] = useState(false);

  const acceleration = force / mass; // F = ma, so a = F/m

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setPosition(p => {
        const newPos = p + acceleration;
        return newPos > 100 ? 0 : newPos;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [running, acceleration]);

  return (
    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Zap className="w-6 h-6 text-purple-400" />
        <span>Force & Motion Simulator ⚡</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Visualization */}
        <div className="bg-black/30 rounded-xl p-6">
          <div className="relative h-32 bg-gray-700 rounded-lg overflow-hidden mb-4">
            {/* Track */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500" />
            
            {/* Box */}
            <div 
              className="absolute bottom-1 bg-blue-500 rounded transition-all duration-100"
              style={{
                left: `${position}%`,
                width: `${mass * 20}px`,
                height: `${mass * 20}px`,
              }}
            >
              <div className="text-center text-xs font-bold mt-1">📦</div>
            </div>

            {/* Force Arrow */}
            {running && (
              <div 
                className="absolute bottom-10 text-red-500 font-bold animate-pulse"
                style={{ left: `${position}%` }}
              >
                {'→'.repeat(Math.floor(force / 2))}
              </div>
            )}
          </div>

          <div className="bg-purple-900/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-300">
              a = {acceleration.toFixed(2)} m/s²
            </p>
            <p className="text-xs text-purple-400">Acceleration</p>
          </div>
        </div>

        {/* Controls */}
        <div>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm text-purple-300 mb-2">
                Force (F): {force} N
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={force}
                onChange={(e) => setForce(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-purple-300 mb-2">
                Mass (m): {mass} kg
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                setRunning(!running);
                if (!running) setPosition(0);
              }}
              className={`flex-1 ${running ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'} px-4 py-3 rounded-lg font-semibold`}
            >
              {running ? 'Stop' : 'Start'}
            </button>
            
            <button
              onClick={() => {
                setPosition(0);
                setRunning(false);
              }}
              className="bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg"
            >
              Reset
            </button>
          </div>

          <div className="bg-purple-900/30 rounded-lg p-3">
            <p className="text-sm text-purple-200 mb-2">
              💡 <strong>Newton's Second Law:</strong>
            </p>
            <p className="text-lg font-bold text-center text-purple-300 mb-2">
              F = m × a
            </p>
            <p className="text-xs text-purple-400">
              Force equals mass times acceleration!
              More force = faster movement 🚀
              More mass = slower movement 🐌
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// GEOGRAPHY SIMULATION
// ============================================================================

export function InteractiveGlobe() {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const continents = [
    { name: 'Africa', emoji: '🌍', population: '1.3B', facts: 'Home to the Sahara Desert and amazing wildlife!' },
    { name: 'Asia', emoji: '🌏', population: '4.6B', facts: 'The largest and most populous continent!' },
    { name: 'Europe', emoji: '🌍', population: '750M', facts: 'Rich in history and diverse cultures!' },
    { name: 'North America', emoji: '🌎', population: '580M', facts: 'From Arctic tundra to tropical beaches!' },
    { name: 'South America', emoji: '🌎', population: '430M', facts: 'Home to the Amazon rainforest!' },
    { name: 'Australia', emoji: '🌏', population: '43M', facts: 'The smallest continent with unique wildlife!' },
    { name: 'Antarctica', emoji: '🧊', population: '0', facts: 'The coldest place on Earth! -89°C recorded!' },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/30">
      <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Globe className="w-6 h-6 text-blue-400" />
        <span>Interactive World Globe 🌍</span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Globe Representation */}
        <div className="bg-black/30 rounded-xl p-6 flex items-center justify-center">
          <div className="text-9xl animate-spin-slow">🌍</div>
        </div>

        {/* Continents List */}
        <div className="space-y-2">
          {continents.map((continent) => (
            <button
              key={continent.name}
              onClick={() => setSelectedContinent(continent.name)}
              className={`w-full text-left p-4 rounded-lg transition-all ${
                selectedContinent === continent.name
                  ? 'bg-blue-600 scale-105'
                  : 'bg-blue-900/30 hover:bg-blue-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{continent.emoji}</span>
                  <div>
                    <p className="font-bold">{continent.name}</p>
                    <p className="text-xs text-blue-300">Pop: {continent.population}</p>
                  </div>
                </div>
                {selectedContinent === continent.name && (
                  <span className="text-yellow-400">✓</span>
                )}
              </div>
              
              {selectedContinent === continent.name && (
                <p className="mt-2 text-sm text-blue-200 border-t border-blue-500/30 pt-2">
                  {continent.facts}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-blue-900/30 rounded-lg p-3">
        <p className="text-sm text-blue-200">
          💡 <strong>Explore:</strong> Click on each continent to learn interesting facts!
          Our Earth has 7 continents and 5 oceans. 🌊
        </p>
      </div>
    </div>
  );
}

// Export all simulations
export const K12Simulations = {
  Math: {
    FractionVisualizer,
  },
  Science: {
    EcosystemSimulator,
  },
  Physics: {
    ForceVisualizer,
  },
  Geography: {
    InteractiveGlobe,
  },
};
