/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050505',
          900: '#0a0a0b',
          800: '#111113',
          700: '#1a1a1d',
          600: '#26262b',
          500: '#3a3a41',
        },
        gold: {
          50: '#fbf7ea',
          100: '#f4e9c4',
          200: '#e9d493',
          300: '#dcbb5c',
          400: '#d0a33a',
          500: '#c08a1f',
          600: '#9c6c17',
          700: '#754f13',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(220,187,92,0.28), 0 18px 60px -20px rgba(220,187,92,0.35)',
        card: '0 24px 80px -32px rgba(0,0,0,0.9)',
      },
      backgroundImage: {
        'gold-sheen':
          'linear-gradient(100deg, #754f13 0%, #dcbb5c 22%, #fbf7ea 42%, #dcbb5c 62%, #9c6c17 100%)',
        'ink-radial':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(220,187,92,0.16), transparent 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,187,92,0.45)' },
          '50%': { boxShadow: '0 0 0 18px rgba(220,187,92,0)' },
        },
        'count-in': {
          '0%': { opacity: '0', transform: 'scale(0.7)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 3.5s linear infinite',
        'pulse-gold': 'pulse-gold 2.4s ease-out infinite',
        'count-in': 'count-in 0.9s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
