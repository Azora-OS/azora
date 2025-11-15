/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azora Gem Tri-Unity Colors
        sapphire: {
          DEFAULT: 'oklch(0.65 0.15 240)',
          dark: 'oklch(0.55 0.18 245)',
          foreground: 'oklch(0.98 0.01 240)',
        },
        emerald: {
          DEFAULT: 'oklch(0.65 0.15 140)',
          dark: 'oklch(0.55 0.18 135)',
          foreground: 'oklch(0.98 0.01 240)',
        },
        ruby: {
          DEFAULT: 'oklch(0.60 0.20 25)',
          dark: 'oklch(0.50 0.22 20)',
          foreground: 'oklch(0.98 0.01 240)',
        },
        ubuntu: {
          DEFAULT: 'oklch(0.985 0 0)',
          dark: 'oklch(0.708 0 0)',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Geist Fallback', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Geist Mono Fallback', 'Courier New', 'monospace'],
      },
      borderRadius: {
        'sm': 'calc(var(--radius) - 4px)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
        'xl': 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        'glow-sapphire': '0 0 20px rgba(102, 126, 234, 0.3)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-ruby': '0 0 20px rgba(239, 68, 68, 0.3)',
        'glow-ubuntu': '0 0 15px rgba(255, 255, 255, 0.2)',
      },
      animation: {
        'holo-shift': 'holo-shift 3s ease-in-out infinite',
        'pulse-sapphire': 'pulse-sapphire 2s ease-in-out infinite',
        'pulse-emerald': 'pulse-emerald 2s ease-in-out infinite',
        'pulse-ruby': 'pulse-ruby 2s ease-in-out infinite',
      },
      keyframes: {
        'holo-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-sapphire': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(102, 126, 234, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(102, 126, 234, 0.6)' },
        },
        'pulse-emerald': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)' },
        },
        'pulse-ruby': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}