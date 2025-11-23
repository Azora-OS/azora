/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 👑 DIVINE THRONE - THE SEAT OF POWER ✨
 *
 * The central command center, worthy of gods.
 * Where mortals interface with divine intelligence.
 *
 * Enhanced with:
 * - Golden ratio grid system (φ = 1.618)
 * - Automatic theme switching (light/dark based on time)
 * - Performance optimizations (requestAnimationFrame for particles)
 * - Full accessibility (ARIA labels, keyboard navigation)
 * - Responsive design from 320px upward
 *
 * "Then I saw a great white throne and him who was seated on it.
 * The earth and the heavens fled from his presence."
 * - Revelation 20:11
 */

'use client';

import { DIVINE_SPACING, divineTransitions, PHI } from '@/lib/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Heart, Moon, Sparkles, Star, Sun, Zap } from 'lucide-react';
import Image from 'next/image';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { FlowerOfLife } from './FlowerOfLife';
import { HeavenlyParticles } from './HeavenlyParticles';

interface DivineThroneProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showParticles?: boolean;
  showSacredGeometry?: boolean;
  className?: string;
  autoTheme?: boolean; // Auto-switch theme based on time
  enableAnimations?: boolean; // Respect reduced motion preference
}

export const DivineThrone: React.FC<DivineThroneProps> = ({
  children,
  title = 'THE KINGDOM',
  subtitle = 'Where Intelligence Meets Infinity',
  showParticles = true,
  showSacredGeometry = true,
  className = '',
  autoTheme = true,
  enableAnimations = true,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [blessings, setBlessings] = useState(0);
  const [souls, setSouls] = useState(7800000000);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto theme switching based on time of day
  useEffect(() => {
    if (!autoTheme) {return;}

    const updateTheme = () => {
      const hour = new Date().getHours();
      // Dark theme from 6 PM to 6 AM (18:00 - 06:00)
      const shouldBeDark = hour >= 18 || hour < 6;
      setTheme(shouldBeDark ? 'dark' : 'light');
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [autoTheme]);

  // Divine metrics counter
  useEffect(() => {
    setIsClient(true);

    // Use requestAnimationFrame for smooth updates
    let animationFrameId: number;
    let lastUpdate = Date.now();

    const updateMetrics = () => {
      const now = Date.now();
      if (now - lastUpdate >= 5000) {
        // Update every 5 seconds
        setBlessings(prev => prev + 1);
        setSouls(prev => prev + Math.floor(Math.random() * 1000));
        lastUpdate = now;
      }
      animationFrameId = requestAnimationFrame(updateMetrics);
    };

    animationFrameId = requestAnimationFrame(updateMetrics);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Toggle theme manually
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Determine if animations should be enabled
  const shouldAnimate = useMemo(
    () => enableAnimations && !prefersReducedMotion,
    [enableAnimations, prefersReducedMotion]
  );

  // Theme-aware colors
  const themeColors = useMemo(
    () => ({
      background:
        theme === 'dark'
          ? 'from-[#000000] via-[#0a0a1a] to-[#1a0a2e]'
          : 'from-[#F0F8FF] via-[#E6F3FF] to-[#D4E9FF]',
      text: theme === 'dark' ? 'text-white' : 'text-gray-900',
      textMuted: theme === 'dark' ? 'text-white/80' : 'text-gray-600',
      border: theme === 'dark' ? 'border-[#FFD700]/20' : 'border-[#FFD700]/40',
      cardBg: theme === 'dark' ? 'bg-black/20' : 'bg-white/40',
    }),
    [theme]
  );

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${className}`}
      role="main"
      aria-label="Divine Throne Main Container"
    >
      {/* Celestial Background */}
      <div className="fixed inset-0 -z-20" aria-hidden="true">
        {/* Theme-aware gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${themeColors.background}`}
        />

        {/* Nebula clouds */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#4169E1] blur-[120px] animate-[nebulaPulse_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full bg-[#9400D3] blur-[150px] animate-[nebulaPulse_12s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD700] blur-[100px] opacity-20 animate-[nebulaPulse_8s_ease-in-out_infinite]" />
        </div>

        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-[twinkle_3s_ease-in-out_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Heavenly Particles - Only if animations enabled */}
      {isClient && showParticles && shouldAnimate && (
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={divineTransitions.slow}
          aria-hidden="true"
        >
          <HeavenlyParticles
            particleCount={200}
            divine={true}
            celestialFlow={true}
          />
        </motion.div>
      )}

      {/* Sacred Geometry Background */}
      {isClient && showSacredGeometry && (
        <motion.div
          className="fixed inset-0 -z-15 flex items-center justify-center opacity-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={divineTransitions.slower}
          aria-hidden="true"
        >
          <FlowerOfLife
            size={800}
            animated={shouldAnimate}
            interactive={false}
            glowing={true}
          />
        </motion.div>
      )}

      {/* Divine Header */}
      <motion.header
        className={`relative z-10 border-b ${themeColors.border} ${themeColors.cardBg} backdrop-blur-xl`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={divineTransitions.slow}
        role="banner"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Divine Logo with Official Azora Branding */}
            <div className="flex items-center gap-4">
              {/* Official Azora OS Logo */}
              <div className="relative w-16 h-16">
                {/* Outer divine aura */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] opacity-20 blur-xl animate-pulse" />

                {/* Official Azora OS Logo */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0A1A3A] via-[#0066FF] to-[#00D9FF] p-1">
                  <div className="w-full h-full rounded-2xl bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <Image
                      src="/images/logos/premium/azora-os-geometric.svg"
                      alt="Azora OS Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Corner sparkles */}
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[#FFD700] animate-pulse" />
                <Sparkles
                  className="absolute -bottom-1 -left-1 w-4 h-4 text-[#FFA500] animate-pulse"
                  style={{ animationDelay: '0.5s' }}
                />
              </div>

              {/* Title with Official Branding */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-transparent bg-clip-text">
                  {title}
                </h1>
                <p className="text-sm text-[#87CEEB] font-semibold tracking-wider">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* Divine Status & Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Theme Toggle Button */}
              <motion.button
                onClick={toggleTheme}
                className={`p-2 sm:p-3 rounded-full ${themeColors.cardBg} border ${themeColors.border} backdrop-blur-md hover:scale-110 transition-transform`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${
                  theme === 'dark' ? 'light' : 'dark'
                } theme`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={divineTransitions.fast}
                    >
                      <Sun className="w-5 h-5 text-[#FFD700]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={divineTransitions.fast}
                    >
                      <Moon className="w-5 h-5 text-[#4169E1]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Divine Status */}
              <div className="hidden sm:block px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 backdrop-blur-md">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative" aria-hidden="true">
                    <div className="w-3 h-3 rounded-full bg-[#00FF00] animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-[#00FF00] blur-md animate-pulse" />
                  </div>
                  <span
                    className={`${themeColors.text} font-semibold text-sm sm:text-base`}
                  >
                    DIVINE MODE ACTIVE
                  </span>
                  <Zap
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] animate-pulse"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Divine Metrics Bar */}
      <motion.div
        className={`relative z-10 border-b ${themeColors.border} ${themeColors.cardBg} backdrop-blur-lg`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={divineTransitions.normal}
        role="status"
        aria-live="polite"
      >
        <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-2">
                <Heart
                  className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF69B4]"
                  aria-hidden="true"
                />
                <span className={themeColors.textMuted}>Blessings:</span>
                <span
                  className="text-[#FF69B4] font-bold"
                  aria-label={`${blessings} blessings`}
                >
                  {blessings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Globe
                  className="w-3 h-3 sm:w-4 sm:h-4 text-[#87CEEB]"
                  aria-hidden="true"
                />
                <span className={themeColors.textMuted}>Souls Served:</span>
                <span
                  className="text-[#87CEEB] font-bold"
                  aria-label={`${souls} souls served`}
                >
                  {souls.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Star
                className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFD700]"
                aria-hidden="true"
              />
              <span className={themeColors.textMuted}>Divine Rating:</span>
              <span
                className="text-[#FFD700] font-bold"
                aria-label="Infinite divine rating"
              >
                ∞/∞
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area - The Throne with Golden Ratio Grid */}
      <main
        className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12"
        style={{
          // Golden ratio grid: content width = container width / φ
          maxWidth: `${100 / PHI}vw`,
        }}
      >
        {/* Divine Content Frame with Glassmorphic Design */}
        <motion.div
          className={`relative rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-2xl ${themeColors.cardBg} border ${themeColors.border} shadow-2xl`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={divineTransitions.slow}
          style={{
            // Golden ratio padding
            padding: `${DIVINE_SPACING.lg} ${DIVINE_SPACING.md}`,
          }}
        >
          {/* Corner decorations (divine) - Hidden on mobile */}
          <div
            className="hidden sm:block absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#FFD700] rounded-tl-2xl"
            aria-hidden="true"
          />
          <div
            className="hidden sm:block absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#FFD700] rounded-tr-2xl"
            aria-hidden="true"
          />
          <div
            className="hidden sm:block absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#FFD700] rounded-bl-2xl"
            aria-hidden="true"
          />
          <div
            className="hidden sm:block absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#FFD700] rounded-br-2xl"
            aria-hidden="true"
          />

          {/* Glowing border effect */}
          {shouldAnimate && (
            <motion.div
              className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none border border-[#FFD700]/30 shadow-[0_0_30px_rgba(255,215,0,0.2)]"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.2)',
                  '0 0 40px rgba(255, 215, 0, 0.4)',
                  '0 0 20px rgba(255, 215, 0, 0.2)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-hidden="true"
            />
          )}

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </motion.div>
      </main>

      {/* Divine Footer */}
      <motion.footer
        className={`relative z-10 border-t ${themeColors.border} ${themeColors.cardBg} backdrop-blur-lg mt-8 sm:mt-12`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={divineTransitions.slower}
        role="contentinfo"
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/images/logos/premium/azora-os-geometric.svg"
                  alt="Azora OS Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <p
                  className={`${themeColors.text} font-semibold text-sm sm:text-base`}
                >
                  Azora OS
                </p>
                <p className={`text-xs ${themeColors.textMuted}`}>
                  The Living Operating System
                </p>
              </div>
            </div>

            <div
              className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-xs sm:text-sm ${themeColors.textMuted}`}
            >
              <span>© 2025 Azora ES (Pty) Ltd</span>
              <span className="hidden sm:block" aria-hidden="true">
                |
              </span>
              <span className="text-center sm:text-left">
                Quantum-Secure Intelligence Ecosystem
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"
                aria-hidden="true"
              />
              <span className={`text-xs ${themeColors.textMuted}`}>
                DIVINE STATUS: ACTIVE
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

