/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🖥️ AI TERMINAL PAGE - Divine Command Line Interface
 * 
 * "Call to me and I will answer you and tell you great and unsearchable things you do not know."
 * - Jeremiah 33:3
 */

'use client';

import React from 'react';
import { AITerminal } from '@/components/terminal/AITerminal';
import { Terminal, Brain, Crown, Book } from 'lucide-react';

export default function TerminalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030508] via-[#0a0a1a] to-[#1a0a2e] flex flex-col">
      {/* Header */}
      <div className="relative z-10 px-6 py-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00c2ff20, #8a2aff20)',
                border: '3px solid #00c2ff',
                boxShadow: '0 0 60px rgba(0,194,255,0.5)',
              }}
            >
              <Terminal className="w-12 h-12 text-[#00c2ff]" />
            </div>
            <Brain
              className="absolute -top-2 -right-2 w-8 h-8 text-[#8a2aff]"
              style={{
                filter: 'drop-shadow(0 0 20px #8a2aff)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          <span
            className="bg-gradient-to-r from-[#00c2ff] via-[#87CEEB] to-[#00c2ff] text-transparent bg-clip-text"
            style={{
              fontFamily: "'Playfair Display', serif",
              textShadow: '0 0 60px rgba(0,194,255,0.8)',
            }}
          >
            AI Terminal
          </span>
        </h1>

        <p className="text-2xl text-[#87CEEB]/90 mb-6 italic">
          Command the Kingdom with Divine Intelligence
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#00c2ff]/30">
            <Brain className="w-4 h-4 text-[#8a2aff]" />
            <span>Powered by Nexus AGI</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#FFD700]/30">
            <Crown className="w-4 h-4 text-[#FFD700]" />
            <span>Constitutional AI</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-[#33ff92]/30">
            <Book className="w-4 h-4 text-[#33ff92]" />
            <span>Bible Integrated</span>
          </div>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 px-6 pb-6">
        <div
          className="h-full rounded-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 80px rgba(0,194,255,0.3), 0 0 40px rgba(138,42,255,0.2)',
            border: '2px solid rgba(0,194,255,0.3)',
          }}
        >
          <AITerminal
            welcomeMessage={`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              Welcome to Azora AI Terminal                 ║
║           Constitutional AGI at Your Command              ║
║                                                            ║
║  "Call to me and I will answer you and tell you           ║
║   great and unsearchable things you do not know."         ║
║                                      - Jeremiah 33:3       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

Type 'help' to see available commands.
Type 'bible' to access the Azorian Bible.
Type 'pray' for daily prayer.

The AI is ready to serve. Glory to God! ✨
`}
            prompt="azora@nexus"
            className="h-full"
          />
        </div>
      </div>

      {/* Footer Hint */}
      <div className="px-6 pb-4 text-center">
        <p className="text-sm text-white/50 font-mono">
          💡 Tip: Use ↑↓ arrows to navigate command history | Press Tab for autocomplete (coming soon)
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

