/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C7A26A',
          contrast: '#0B0B0D',
        },
        background: {
          DEFAULT: '#0E0F13',
          surface: '#14151C',
        },
        text: {
          muted: '#9BA3AF',
        },
        success: '#4ADE80',
        danger: '#F87171',
        // Light theme colors
        light: {
          primary: '#14151C',
          background: '#FAFAFA',
          surface: '#FFFFFF',
          muted: '#6B7280',
        }
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'aurora': '0.2px',
      },
      borderRadius: {
        'aurora': '1.25rem',
      },
      boxShadow: {
        'aurora-soft': '0 10px 30px rgba(0,0,0,0.35)',
        'aurora-glow': '0 0 20px rgba(199, 162, 106, 0.3)',
      },
      backdropBlur: {
        'aurora': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(199, 162, 106, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(199, 162, 106, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

