import type { Config } from 'tailwindcss';
import { premiumColors, typography, spacing, shadows, borderRadius } from './design-tokens';

const config: Config = {
    content: [
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
        './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: premiumColors.primary,
                accent: premiumColors.accent,
            },
            fontFamily: {
                sans: typography.fontFamily.sans.split(', '),
                mono: typography.fontFamily.mono.split(', '),
            },
            fontSize: typography.fontSize as any,
            spacing: spacing as any,
            boxShadow: {
                ...shadows,
            },
            borderRadius: borderRadius as any,
            animation: {
                'gradient': 'gradient 8s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': {
                        'background-position': '0% 50%',
                    },
                    '50%': {
                        'background-position': '100% 50%',
                    },
                },
                float: {
                    '0%, 100%': {
                        transform: 'translateY(0px)',
                    },
                    '50%': {
                        transform: 'translateY(-20px)',
                    },
                },
            },
            backgroundImage: {
                'gradient-primary': premiumColors.gradients.primary,
                'gradient-accent': premiumColors.gradients.accent,
                'gradient-sunset': premiumColors.gradients.sunset,
                'gradient-ocean': premiumColors.gradients.ocean,
                'gradient-forest': premiumColors.gradients.forest,
            },
        },
    },
    plugins: [],
};

export default config;
