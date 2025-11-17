/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ubuntu: {
          sapphire: '#3B82F6',
          emerald: '#10B981', 
          ruby: '#EF4444',
          unity: '#FFFFFF'
        }
      }
    },
  },
  plugins: [],
}