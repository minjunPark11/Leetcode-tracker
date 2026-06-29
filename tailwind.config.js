/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        difficulty: {
          easy: '#00b8a3',
          medium: '#ffb800',
          hard: '#ff375f',
        },
      },
    },
  },
  plugins: [],
}
