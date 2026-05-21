/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          950: '#050505',
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#252525',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8cc7a',
          dark: '#8a6e2a',
          glow: '#d4a017',
        },
        rose: {
          pop: '#e91e8c',
          soft: '#f472b6',
          deep: '#9d174d',
        },
        cream: '#f5f0eb',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'flicker': 'flicker 3s infinite',
        'grain': 'grain 0.5s steps(1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '1' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-2%, -3%)' },
          '20%': { transform: 'translate(1%, 2%)' },
          '30%': { transform: 'translate(3%, -1%)' },
          '40%': { transform: 'translate(-1%, 3%)' },
          '50%': { transform: 'translate(-3%, 1%)' },
          '60%': { transform: 'translate(2%, -2%)' },
          '70%': { transform: 'translate(1%, 3%)' },
          '80%': { transform: 'translate(-2%, -1%)' },
          '90%': { transform: 'translate(3%, 2%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.4)' },
          '50%': { boxShadow: '0 0 60px rgba(201,168,76,0.8), 0 0 100px rgba(201,168,76,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
