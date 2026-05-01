/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(0, 0, 0, 0.1)',
        'premium': '0 8px 30px -4px rgba(0, 0, 0, 0.05), 0 0 4px rgba(0,0,0,0.02)',
        'premium-hover': '0 12px 40px -6px rgba(0, 0, 0, 0.08), 0 0 5px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}
