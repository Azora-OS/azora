import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                azora: {
                    purple: '#667eea',
                    violet: '#764ba2',
                    pink: '#f093fb',
                },
            },
        },
    },
    plugins: [],
};
export default config;
