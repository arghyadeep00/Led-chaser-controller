/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120', // Main background
          900: '#111827', // Sidebar background
          850: '#131D31', // Card hover / elevated
          800: '#172033', // Card background
          700: '#1E293B', // Soft borders
          600: '#334155', // Active borders / subtle text
          500: '#475569',
        },
        accent: {
          DEFAULT: '#38BDF8', // Cyan/sky blue
          hover: '#0EA5E9',
          glow: 'rgba(56, 189, 248, 0.4)',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple/violet
          hover: '#7C3AED',
          glow: 'rgba(139, 92, 246, 0.4)',
        },
        led: {
          off: '#1E293B',
          red: '#EF4444',
          amber: '#F59E0B',
          green: '#22C55E',
          cyan: '#38BDF8',
          blue: '#3B82F6',
          purple: '#A855F7',
          active: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -2px rgba(56, 189, 248, 0.35)',
        'glow-purple': '0 0 20px -2px rgba(139, 92, 246, 0.35)',
        'glow-led': '0 0 15px 4px rgba(56, 189, 248, 0.55)',
        'glow-green': '0 0 15px 3px rgba(34, 197, 94, 0.45)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'led-pulse': 'ledGlow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        ledGlow: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '100%': { transform: 'scale(1.05)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
