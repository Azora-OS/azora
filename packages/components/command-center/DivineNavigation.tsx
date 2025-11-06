/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * 🧭 COMMAND NAVIGATION - COMMAND CENTER WAYFINDING
 *
 * Navigation for the Command Center
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Home,
  GraduationCap,
  Boxes,
  Shield,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export const CommandNavigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Command Center', href: '/command-center', icon: Crown },
    { name: 'Home', href: '/', icon: Home },
    { name: 'Sapiens', href: '/sapiens', icon: GraduationCap },
    { name: 'Services', href: '/services', icon: Boxes },
    { name: 'Aegis', href: '/aegis', icon: Shield },
  ];

  return (
    <nav className="relative z-50">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group relative px-6 py-3 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
          >
            {/* Premium glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 border border-[#FFD700]/0 group-hover:border-[#FFD700]/30 rounded-full transition-colors" />

            {/* Content */}
            <div className="relative flex items-center gap-2">
              <item.icon className="w-5 h-5 text-[#FFD700] group-hover:animate-pulse" />
              <span className="text-white group-hover:text-[#FFD700] transition-colors font-semibold">
                {item.name}
              </span>
            </div>

            {/* Sparkle on hover */}
            <Sparkles className="absolute top-1 right-1 w-3 h-3 text-[#FFD700] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          </Link>
        ))}
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 rounded-full bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-[#FFD700]" />
          ) : (
            <Menu className="w-6 h-6 text-[#FFD700]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full right-0 mt-4 w-64 p-4 rounded-2xl bg-black/90 backdrop-blur-xl border border-[#FFD700]/30 shadow-[0_0_40px_rgba(255,215,0,0.2)] md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#FFD700]/10 transition-colors group"
            >
              <item.icon className="w-5 h-5 text-[#FFD700]" />
              <span className="text-white group-hover:text-[#FFD700] font-semibold">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default DivineNavigation;

