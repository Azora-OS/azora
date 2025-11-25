/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                azora: {
                    navy: '#0f172a',
                    slate: '#334155',
                    steel: '#94a3b8',
                },
            },
        },
    },
    plugins: [],
}
