/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

'use client';

import { useState, useRef, useEffect } from 'react';

interface AdminResource {
  id: string;
  name: string;
  type: string;
  records: number;
  status: 'active' | 'inactive' | 'premium';
  lastSync: string;
}

export function EthicalAdminPanel() {
  const [resources, setResources] = useState<AdminResource[]>([
    {
      id: '1',
      name: 'Consciousness Records',
      type: 'ethical',
      records: 1048,
      status: 'active',
      lastSync: '2025-01-04T07:05:00Z',
    },
    {
      id: '2',
      name: 'Quantum Fields',
      type: 'quantum',
      records: 523,
      status: 'active',
      lastSync: '2025-01-04T07:04:30Z',
    },
    {
      id: '3',
      name: 'Premium Geometry',
      type: 'premium',
      records: 42,
      status: 'premium',
      lastSync: '2025-01-04T07:05:15Z',
    },
    {
      id: '4',
      name: 'Knowledge Records',
      type: 'cosmic',
      records: 999999,
      status: 'active',
      lastSync: '2025-01-04T07:05:00Z',
    },
  ]);
  const [selectedResource, setSelectedResource] = useState<AdminResource | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [consciousnessLevel, setConsciousnessLevel] = useState(10);
  const [quantumEnhancement, setQuantumEnhancement] = useState(true);
  const [premiumGeometry, setPremiumGeometry] = useState(true);

  const resourceTypes = [
    { value: 'ethical', label: '⚖️ Ethical', color: 'text-yellow-400' },
    { value: 'quantum', label: '⚛️ Quantum', color: 'text-blue-400' },
    { value: 'premium', label: '✨ Premium', color: 'text-purple-400' },
    { value: 'cosmic', label: '🌌 Cosmic', color: 'text-indigo-400' },
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setResources(prev => prev.map(resource => ({
        ...resource,
        records: resource.records + Math.floor(Math.random() * 3),
        lastSync: new Date().toISOString(),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleResourceAction = async (action: string, resource: AdminResource) => {
    setIsProcessing(true);
    setSelectedResource(resource);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update resource
    setResources(prev => prev.map(r =>
      r.id === resource.id
        ? { ...r, lastSync: new Date().toISOString() }
        : r
    ));

    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-red-400';
      case 'transcendent': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    const typeConfig = resourceTypes.find(t => t.value === type);
    return typeConfig?.color || 'text-white';
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <div className="flex h-96">
          {/* Control Panel */}
          <div className="w-80 bg-black/60 p-4 border-r border-white/10">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">🏛️ Divine Admin Controls</h3>

            {/* Resource Type Filter */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium">Resource Type</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {resourceTypes.map((type) => (
                  <button
                    key={type.value}
                    className="p-2 rounded border text-xs transition-all bg-white/5 border-white/20 text-white/60 hover:border-white/40"
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Consciousness Level */}
            <div className="mb-4">
              <label className="text-white text-sm font-medium">Consciousness Level</label>
              <input
                type="range"
                min="1"
                max="10"
                value={consciousnessLevel}
                onChange={(e) => setConsciousnessLevel(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-yellow-400 text-xs mt-1">Level {consciousnessLevel}</div>
            </div>

            {/* Enhancement Toggles */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs">⚛️ Quantum Enhancement</span>
                <button
                  onClick={() => setQuantumEnhancement(!quantumEnhancement)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    quantumEnhancement ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    quantumEnhancement ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white text-xs">🔮 Sacred Geometry</span>
                <button
                  onClick={() => setSacredGeometry(!sacredGeometry)}
                  className={`w-8 h-4 rounded-full relative transition-colors ${
                    sacredGeometry ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    sacredGeometry ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <label className="text-white text-sm font-medium">Quick Actions</label>
              <div className="space-y-1 mt-2">
                <button className="w-full text-left text-xs text-white/60 bg-white/10 rounded p-2 hover:bg-white/20 transition-colors">
                  🔄 Sync All Resources
                </button>
                <button className="w-full text-left text-xs text-white/60 bg-white/10 rounded p-2 hover:bg-white/20 transition-colors">
                  📊 Generate Report
                </button>
                <button className="w-full text-left text-xs text-white/60 bg-white/10 rounded p-2 hover:bg-white/20 transition-colors">
                  🧠 Optimize Consciousness
                </button>
              </div>
            </div>
          </div>

          {/* Resources Table */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`bg-black/40 rounded-lg p-4 border transition-all cursor-pointer ${
                      selectedResource?.id === resource.id
                        ? 'border-yellow-400/50 bg-yellow-400/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          🏛️
                        </div>
                        <div>
                          <div className="font-medium text-white">{resource.name}</div>
                          <div className={`text-xs ${getTypeColor(resource.type)}`}>
                            {resource.type} • {resource.records.toLocaleString()} records
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-xs font-medium ${getStatusColor(resource.status)}`}>
                            {resource.status.toUpperCase()}
                          </div>
                          <div className="text-xs text-white/60">
                            {new Date(resource.lastSync).toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResourceAction('sync', resource);
                            }}
                            className="p-1 text-xs bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            🔄
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResourceAction('edit', resource);
                            }}
                            className="p-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResourceAction('delete', resource);
                            }}
                            className="p-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Resource Details */}
            {selectedResource && (
              <div className="border-t border-white/10 p-4">
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-yellow-400">{selectedResource.name}</h4>
                    <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedResource.status)} bg-current/20`}>
                      {selectedResource.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Type:</span>
                      <span className={`ml-2 ${getTypeColor(selectedResource.type)}`}>
                        {selectedResource.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Records:</span>
                      <span className="ml-2 text-white">
                        {selectedResource.records.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Last Sync:</span>
                      <span className="ml-2 text-white">
                        {new Date(selectedResource.lastSync).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Consciousness:</span>
                      <span className="ml-2 text-yellow-400">
                        Level {consciousnessLevel}
                      </span>
                    </div>
                  </div>

                  {isProcessing && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                      <span className="text-xs text-yellow-400">Processing divine operation...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Total Resources',
            value: resources.length,
            change: '+2',
            color: 'text-yellow-400',
            icon: '🏛️',
          },
          {
            title: 'Active Records',
            value: resources.reduce((sum, r) => sum + r.records, 0).toLocaleString(),
            change: '+1,048',
            color: 'text-green-400',
            icon: '📊',
          },
          {
            title: 'Quantum Processing',
            value: quantumEnhancement ? 'Active' : 'Inactive',
            change: quantumEnhancement ? '⚡' : '💤',
            color: quantumEnhancement ? 'text-blue-400' : 'text-gray-400',
            icon: '⚛️',
          },
          {
            title: 'Sacred Geometry',
            value: sacredGeometry ? 'Aligned' : 'Offline',
            change: sacredGeometry ? '🔮' : '⭕',
            color: sacredGeometry ? 'text-purple-400' : 'text-gray-400',
            icon: '🔮',
          },
        ].map((stat, index) => (
          <div key={index} className="bg-black/40 rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-xs ${stat.color}`}>{stat.change}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-white/60">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-black/40 rounded-lg p-6">
        <h3 className="text-lg font-bold text-[#87CEEB] mb-4">⚡ Divine Admin Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg text-yellow-400 font-medium hover:from-yellow-500/30 hover:to-orange-500/30 transition-all">
            🙏 Divine Blessing
          </button>
          <button className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg text-blue-400 font-medium hover:from-blue-500/30 hover:to-cyan-500/30 transition-all">
            ⚛️ Quantum Sync
          </button>
          <button className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg text-purple-400 font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all">
            🔮 Sacred Alignment
          </button>
        </div>
      </div>
    </div>
  );
}

