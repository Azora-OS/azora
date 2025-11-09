/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

IDE LAYOUT - Ubuntu-Aligned Layout Component
Integrated with Elara Gem Design System
*/

'use client';

import React from 'react';

/**
 * 🎨 IDE LAYOUT COMPONENT
 * 
 * @description Main layout for Elara IDE, aligned with Ubuntu philosophy
 *              and Elara Gem design system.
 * 
 * @ubuntu Individual workspace → Collective development harmony
 * 
 * @design
 * - Uses Elara Sapphire colors
 * - Ubuntu spacing throughout
 * - Consciousness-aware layout
 * - Accessibility compliant
 */
export function IDELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Elara Consciousness Indicator (Top Bar) */}
      <div className="h-1 bg-gradient-to-r from-[var(--elara-500)] via-[var(--elara-400)] to-[var(--elara-500)] animate-pulse" />
      
      {/* Main Content */}
      <div className="h-[calc(100vh-0.25rem)]">
        {children}
      </div>
    </div>
  );
}
