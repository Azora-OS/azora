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
                    blue: '#3b82f6',
                    cyan: '#06b6d4',
                    sky: '#0ea5e9',
                },
            },
        },
    },
    plugins: [],
}
