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
        'neon-cyan': '#00FFB3',
        'neon-cyan-hover': '#00CC8F',
        'card-bg': '#1E1E1E',
        'border-gray': '#333333',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'noto': ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.8s ease-out',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        neonPulse: {
          '0%': { textShadow: '0 0 10px #00FFB3, 0 0 20px #00FFB3, 0 0 30px #00FFB3' },
          '100%': { textShadow: '0 0 5px #00FFB3, 0 0 10px #00FFB3, 0 0 15px #00FFB3' },
        },
      },
    },
  },
  plugins: [],
} 