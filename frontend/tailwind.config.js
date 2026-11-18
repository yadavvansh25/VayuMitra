/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vayu: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        aqi: {
          good: '#10b981',
          moderate: '#f59e0b',
          sensitive: '#f97316',
          unhealthy: '#ef4444',
          veryUnhealthy: '#8b5cf6',
          severe: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['Nunito Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'clay': '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'clay-hover': '0 20px 30px -10px rgba(15, 23, 42, 0.1), 0 10px 15px -5px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
