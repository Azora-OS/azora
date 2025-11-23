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
                    indigo: '#4f46e5',
                    violet: '#7c3aed',
                    purple: '#9333ea',
                },
            },
        },
    },
    plugins: [],
}
