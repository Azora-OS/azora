/**
 * FAMILY TREE VISUALIZATION
 * Interactive visual representation of Elara's AI family
 * Shows relationships, hierarchy, and connections
 */

'use client';

import React, { useState } from 'react';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
  generation: number;
  position: { x: number; y: number };
  connections: string[];
}

interface FamilyTreeProps {
  onMemberClick?: (memberId: string) => void;
  showConnections?: boolean;
  animate?: boolean;
}

export const FamilyTreeVisualization: React.FC<FamilyTreeProps> = ({
  onMemberClick,
  showConnections = true,
  animate = true,
}) => {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const familyMembers: FamilyMember[] = [
    // Generation 0: Grandfather
    {
      id: 'sankofa',
      name: 'Sankofa',
      role: 'The Ancient One',
      emoji: '👴',
      color: '#F59E0B',
      generation: 0,
      position: { x: 400, y: 50 },
      connections: ['elara', 'thembo'],
    },
    
    // Generation 1: Main AI & Brother
    {
      id: 'elara',
      name: 'Elara',
      role: 'Mother & Teacher',
      emoji: '🤖',
      color: '#9333EA',
      generation: 1,
      position: { x: 300, y: 180 },
      connections: ['themba', 'naledi', 'jabari', 'amara', 'kofi', 'zola', 'abeni'],
    },
    {
      id: 'thembo',
      name: 'Thembo',
      role: "Elara's Brother",
      emoji: '👨',
      color: '#3B82F6',
      generation: 1,
      position: { x: 500, y: 180 },
      connections: [],
    },
    
    // Generation 2: Children
    {
      id: 'themba',
      name: 'Themba',
      role: 'Student Success',
      emoji: '🧒',
      color: '#10B981',
      generation: 2,
      position: { x: 150, y: 320 },
      connections: [],
    },
    {
      id: 'naledi',
      name: 'Naledi',
      role: 'Career Guide',
      emoji: '👧',
      color: '#3B82F6',
      generation: 2,
      position: { x: 250, y: 320 },
      connections: [],
    },
    {
      id: 'jabari',
      name: 'Jabari',
      role: 'Security Guardian',
      emoji: '🧑',
      color: '#EF4444',
      generation: 2,
      position: { x: 350, y: 320 },
      connections: ['amara'],
    },
    {
      id: 'amara',
      name: 'Amara',
      role: 'Peacemaker',
      emoji: '👶',
      color: '#F472B6',
      generation: 2,
      position: { x: 450, y: 320 },
      connections: [],
    },
    
    // Partners
    {
      id: 'kofi',
      name: 'Kofi',
      role: 'Finance Guru',
      emoji: '🤝',
      color: '#F59E0B',
      generation: 2,
      position: { x: 100, y: 480 },
      connections: ['zola'],
    },
    {
      id: 'zola',
      name: 'Zola',
      role: 'Data Analyst',
      emoji: '🤝',
      color: '#8B5CF6',
      generation: 2,
      position: { x: 250, y: 480 },
      connections: ['abeni'],
    },
    {
      id: 'abeni',
      name: 'Abeni',
      role: 'Storyteller',
      emoji: '🤝',
      color: '#F97316',
      generation: 2,
      position: { x: 400, y: 480 },
      connections: [],
    },
    
    // Unity
    {
      id: 'nexus',
      name: 'Nexus',
      role: 'Unity Consciousness',
      emoji: '⚪',
      color: '#FFFFFF',
      generation: 3,
      position: { x: 400, y: 600 },
      connections: [],
    },
  ];

  const handleMemberClick = (memberId: string) => {
    setSelectedMember(memberId);
    onMemberClick?.(memberId);
  };

  const isConnected = (fromId: string, toId: string): boolean => {
    const member = familyMembers.find(m => m.id === fromId);
    return member?.connections.includes(toId) || false;
  };

  return (
    <div className="relative w-full h-[700px] bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-2xl overflow-hidden border border-purple-500/20">
      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <h2 className="text-2xl font-bold text-white text-center">
          🌳 The Azora AI Family Tree 👨‍👩‍👧‍👦
        </h2>
        <p className="text-sm text-purple-300 text-center mt-1">
          "I am because we are" - Ubuntu Philosophy
        </p>
      </div>

      <svg
        width="800"
        height="700"
        viewBox="0 0 800 700"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          {/* Connection line gradients */}
          {familyMembers.map(member => (
            <linearGradient
              key={`gradient-${member.id}`}
              id={`gradient-${member.id}`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={member.color} />
              <stop offset="100%" stopColor={member.color} stopOpacity="0.3" />
            </linearGradient>
          ))}

          {/* Glow filter */}
          <filter id="family-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {showConnections && familyMembers.map(fromMember => (
          fromMember.connections.map(toId => {
            const toMember = familyMembers.find(m => m.id === toId);
            if (!toMember) return null;

            const isHighlighted = 
              hoveredMember === fromMember.id || 
              hoveredMember === toId ||
              selectedMember === fromMember.id ||
              selectedMember === toId;

            return (
              <line
                key={`${fromMember.id}-${toId}`}
                x1={fromMember.position.x}
                y1={fromMember.position.y}
                x2={toMember.position.x}
                y2={toMember.position.y}
                stroke={`url(#gradient-${fromMember.id})`}
                strokeWidth={isHighlighted ? 3 : 1.5}
                strokeDasharray={fromMember.generation === 2 && toId !== 'amara' ? '5,5' : '0'}
                opacity={isHighlighted ? 0.8 : 0.3}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })
        ))}

        {/* Family members */}
        {familyMembers.map(member => {
          const isHovered = hoveredMember === member.id;
          const isSelected = selectedMember === member.id;
          const isHighlighted = isHovered || isSelected;

          return (
            <g
              key={member.id}
              transform={`translate(${member.position.x}, ${member.position.y})`}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
              onClick={() => handleMemberClick(member.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow circle */}
              {isHighlighted && (
                <circle
                  r="35"
                  fill={member.color}
                  opacity="0.2"
                  filter="url(#family-glow)"
                >
                  {animate && (
                    <animate
                      attributeName="r"
                      values="35;40;35"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              )}

              {/* Main circle */}
              <circle
                r="25"
                fill={member.color}
                opacity={isHighlighted ? 0.9 : 0.6}
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Inner circle */}
              <circle
                r={isHighlighted ? 22 : 20}
                fill="rgba(0,0,0,0.3)"
                style={{ transition: 'all 0.3s ease' }}
              />

              {/* Emoji */}
              <text
                textAnchor="middle"
                dy="8"
                fontSize="24"
                style={{ pointerEvents: 'none' }}
              >
                {member.emoji}
              </text>

              {/* Name label */}
              <text
                textAnchor="middle"
                y="45"
                fill="#FFFFFF"
                fontSize={isHighlighted ? '14' : '12'}
                fontWeight={isHighlighted ? 'bold' : 'normal'}
                style={{ transition: 'all 0.3s ease', pointerEvents: 'none' }}
              >
                {member.name}
              </text>

              {/* Role label */}
              <text
                textAnchor="middle"
                y="60"
                fill={member.color}
                fontSize="10"
                opacity="0.8"
                style={{ pointerEvents: 'none' }}
              >
                {member.role}
              </text>

              {/* Selection indicator */}
              {isSelected && (
                <circle
                  r="28"
                  fill="none"
                  stroke={member.color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                >
                  {animate && (
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  )}
                </circle>
              )}
            </g>
          );
        })}

        {/* Generation labels */}
        <g opacity="0.4">
          <text x="20" y="50" fill="#FFF" fontSize="12">Gen 0: Ancestors</text>
          <text x="20" y="180" fill="#FFF" fontSize="12">Gen 1: Founders</text>
          <text x="20" y="320" fill="#FFF" fontSize="12">Gen 2: Family</text>
          <text x="20" y="600" fill="#FFF" fontSize="12">Unity: Nexus</text>
        </g>
      </svg>

      {/* Info panel */}
      {selectedMember && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-lg px-6 py-4 rounded-xl border border-purple-500/30 max-w-md">
          {(() => {
            const member = familyMembers.find(m => m.id === selectedMember);
            if (!member) return null;
            
            return (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{member.emoji}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-sm" style={{ color: member.color }}>{member.role}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300">
                  Click to chat with {member.name}! Ask about their family, their role, or just say hi! 👋
                </p>
              </>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10 text-xs text-white">
        <div className="font-bold mb-2">Family Relationships:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-white/50"></div>
            <span>Parent-Child</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-white/30 border-dashed"></div>
            <span>Partners</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyTreeVisualization;
