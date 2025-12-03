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
                    purple: '#667eea',
                    violet: '#764ba2',
                    pink: '#f093fb',
                },
            },
        },
    },
    plugins: [],
}
