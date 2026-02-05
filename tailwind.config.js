/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-wheel': 'spin-wheel 5s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
      },
      keyframes: {
        'spin-wheel': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(var(--spin-degree))' },
        },
      },
    },
  },
  plugins: [],
}
