/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌐 OFFLINE PAGE
 * 
 * "And lo, I am with you always, even to the end of the age." - Matthew 28:20
 */

'use client';

import React from 'react';
import { WifiOff, RefreshCw, Heart } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a] flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00c2ff]/20 to-[#8a2aff]/20 flex items-center justify-center">
              <WifiOff className="w-16 h-16 text-[#00c2ff]" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-[#00c2ff]/30 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          You're Offline
        </h1>
        
        <p className="text-2xl text-[#87CEEB] mb-8">
          No internet? No problem.
        </p>

        <div className="max-w-xl mx-auto mb-12 space-y-6">
          <p className="text-xl text-white/80 leading-relaxed">
            Azora OS works offline because we serve <span className="text-[#33ff92] font-bold">the 4 billion</span> without reliable internet.
          </p>
          
          <p className="text-lg text-white/70 leading-relaxed">
            Your data is saved locally. When you reconnect, everything will sync automatically.
          </p>

          <div className="p-6 rounded-2xl bg-white/5 border border-[#FFD700]/30 backdrop-blur-xl">
            <p className="text-xl text-[#FFD700] italic font-semibold mb-2">
              "And lo, I am with you always, even to the end of the age."
            </p>
            <p className="text-sm text-[#87CEEB]">- Matthew 28:20</p>
          </div>
        </div>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="px-8 py-4 bg-gradient-to-r from-[#00c2ff] to-[#8a2aff] text-white font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
        >
          <RefreshCw className="w-6 h-6" />
          <span>Try Again</span>
        </button>

        {/* Features Available Offline */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { title: 'Bible', description: 'Read sacred text' },
            { title: 'Terminal', description: 'Run commands' },
            { title: 'Sapiens', description: 'Continue learning' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold text-[#33ff92] mb-2">{feature.title}</h3>
              <p className="text-sm text-white/70">{feature.description}</p>
              <p className="text-xs text-[#FFD700] mt-2">✓ Works offline</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-center gap-2 text-white/50">
          <Heart className="w-5 h-5 text-[#ff6b9d]" />
          <span>Built for everyone, everywhere</span>
        </div>
      </div>
    </div>
  );
}

