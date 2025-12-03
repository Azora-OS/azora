'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Brain, 
  Users, 
  Code, 
  Palette, 
  Database, 
  Heart, 
  Zap, 
  Globe, 
  Target, 
  Lightbulb, 
  Settings, 
  Menu, 
  X, 
  Shield
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  ubuntuScore?: number;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    name: 'Citadel Command',
    href: '/',
    icon: Rocket,
    description: 'Main command center for all operations',
    ubuntuScore: 98
  },
  {
    name: 'Ubuntu Projects',
    href: '/ubuntu-projects',
    icon: Heart,
    description: 'Community-focused project management',
    ubuntuScore: 95
  },
  {
    name: 'Citadel AI Agents',
    href: '/citadel-ai-agents',
    icon: Brain,
    description: 'AI agents turning dreams into reality',
    ubuntuScore: 97,
    badge: 'AI'
  },
  {
    name: 'Dream Reality Workshop',
    href: '/dream-reality-workshop',
    icon: Lightbulb,
    description: 'Submit dreams and watch them become reality',
    ubuntuScore: 96,
    badge: 'NEW'
  },
  {
    name: 'Ubuntu Workspace',
    href: '/ubuntu-workspace',
    icon: Users,
    description: 'Collaborative Ubuntu-aligned workspace',
    ubuntuScore: 94
  },
  {
    name: 'Code Chamber',
    href: '/code-chamber',
    icon: Code,
    description: 'AI-powered development environment',
    ubuntuScore: 92
  },
  {
    name: 'Design Studio',
    href: '/design-studio',
    icon: Palette,
    description: 'Ubuntu-inspired design systems',
    ubuntuScore: 91
  },
  {
    name: 'Data Forge',
    href: '/data-forge',
    icon: Database,
    description: 'Analytics and insights generation',
    ubuntuScore: 89
  },
  {
    name: 'Collaborate',
    href: '/collaborate',
    icon: Users,
    description: 'Real-time team collaboration',
    ubuntuScore: 88
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Target,
    description: 'Traditional project management',
    ubuntuScore: 85
  },
  {
    name: 'Ideas Board',
    href: '/ideas-board',
    icon: Lightbulb,
    description: 'Innovation and ideation space',
    ubuntuScore: 87
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: Globe,
    description: 'Ubuntu marketplace integration',
    ubuntuScore: 90
  },
  {
    name: 'Deploy',
    href: '/deploy',
    icon: Rocket,
    description: 'Deployment and launch systems',
    ubuntuScore: 86
  }
];

export default function BuildspacesNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block">
        <div className="bg-black/90 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Citadel BuildSpaces</h1>
                  <p className="text-xs text-cyan-400">Ubuntu Innovation Hub</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="hidden xl:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={`relative px-3 py-2 rounded-lg transition-all cursor-pointer group ${
                        isActive(item.href)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 bg-cyan-500 text-black text-xs rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                        {item.ubuntuScore && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />
                            <span className="text-xs">{item.ubuntuScore}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-white/20 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-400">{item.description}</div>
                        {item.ubuntuScore && (
                          <div className="flex items-center gap-1 mt-1 text-red-400">
                            <Heart className="w-3 h-3" />
                            <span>Ubuntu Score: {item.ubuntuScore}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Ubuntu Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-400 font-medium">Ubuntu Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Systems Nominal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-black/90 backdrop-blur-sm border-b border-white/10">
          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Citadel</h1>
                  <p className="text-xs text-cyan-400">BuildSpaces</p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/95 backdrop-blur-sm border-b border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <motion.div
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-1 bg-cyan-500 text-black text-xs rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {item.ubuntuScore && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-xs">{item.ubuntuScore}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Ubuntu Status Footer */}
            <div className="px-4 py-3 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <Heart className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-400 font-medium">Ubuntu Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">Systems Nominal</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Tablet Navigation (Horizontal Scroll) */}
      <nav className="hidden md:block lg:hidden">
        <div className="bg-black/90 backdrop-blur-sm border-b border-white/10">
          <div className="px-4">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      isActive(item.href)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 bg-cyan-500 text-black text-xs rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
