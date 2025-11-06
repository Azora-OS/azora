/**
 * AZORA PROPRIETARY LICENSE
 *
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import React, { useState } from 'react';

/**
 * DashboardLayout - Main layout wrapper for dashboard pages
 * Provides consistent structure with sidebar and main content area
 * Enhanced with living organism skin concept
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content
 * @param {boolean} props.showSidebar - Show/hide sidebar
 * @param {React.ReactNode} props.sidebar - Sidebar content
 * @param {boolean} props.fullWidth - Use full width without sidebar
 * @returns {JSX.Element}
 */
export function DashboardLayout({ children, showSidebar = true, sidebar, fullWidth = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20 relative overflow-hidden">
      {/* Living Organism Skin Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Pulsing organic veins */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-secondary-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-accent-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Subtle organic membrane */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05)_0%,rgba(0,0,0,0)_70%)]"></div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        {showSidebar && sidebarOpen && (
          <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-neutral-200/30 bg-white/80 backdrop-blur-xl dark:border-neutral-800/30 dark:bg-neutral-950/80 shadow-lg shadow-primary-500/5">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className={`w-full transition-all duration-500 ease-in-out ${showSidebar && sidebarOpen ? 'ml-64' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
