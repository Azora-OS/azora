import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        '../../packages/@azora/master-ui/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: 'hsl(250, 100%, 97%)',
                    100: 'hsl(250, 95%, 92%)',
                    200: 'hsl(250, 90%, 85%)',
                    300: 'hsl(250, 85%, 75%)',
                    400: 'hsl(250, 80%, 65%)',
                    500: 'hsl(250, 75%, 55%)',
                    600: 'hsl(250, 70%, 45%)',
                    700: 'hsl(250, 65%, 35%)',
                    800: 'hsl(250, 60%, 25%)',
                    900: 'hsl(250, 90%, 15%)',
                },
                accent: {
                    50: 'hsl(280, 100%, 97%)',
                    100: 'hsl(280, 95%, 92%)',
                    200: 'hsl(280, 90%, 85%)',
                    300: 'hsl(280, 85%, 75%)',
                    400: 'hsl(280, 80%, 65%)',
                    500: 'hsl(280, 75%, 55%)',
                    600: 'hsl(280, 70%, 45%)',
                    700: 'hsl(280, 65%, 35%)',
                    800: 'hsl(280, 60%, 25%)',
                    900: 'hsl(280, 90%, 15%)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'gradient': 'gradient 8s ease infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
