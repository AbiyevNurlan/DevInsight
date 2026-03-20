const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050505', // Deepest Obsidian
          card: '#121215',    // Zinc Card
          subtle: '#18181B'
        },
        primary: {
          DEFAULT: '#FFFFFF', // Pure White
          foreground: '#000000'
        },
        secondary: {
          DEFAULT: '#27272A',
          foreground: '#FAFAFA'
        },
        zinc: {
          400: '#A1A1AA',
          500: '#71717A', // Secondary text
          600: '#52525B',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        },
        border: 'rgba(255, 255, 255, 0.1)', // Default hairline border

        // System colors REPLACED with Monochrome variants
        system: {
          blue: '#FFFFFF',   // No blue, just white
          green: '#FFFFFF',  // No green
          red: '#FFFFFF',    // No red
          orange: '#EDEDED', // Light Gray
        },
        // Modern Dashboard 2026 Theme
        futuristic: {
          bg: '#0f172a',       // Deep Navy/Black
          card: 'rgba(15, 23, 42, 0.6)',
          glass: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        neon: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          green: '#10b981',
          orange: '#f97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'sans-serif', ...defaultTheme.fontFamily.sans],
      },
      letterSpacing: {
        tight: '-0.025em',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      backdropBlur: {
        '2xl': '40px', // Heavy blur for Dock
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 255, 255, 0.1)', // Subtle white glow
        'subtle': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glass-inset': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      borderWidth: {
        'hairline': '0.5px',
      }
    },
  },
  safelist: [
    'flex', 'flex-col', 'flex-row', 'items-center', 'justify-between', 'gap-6', 'gap-4', 'p-4', 'p-6', 'p-8',
    'w-full', 'max-w-7xl', 'mx-auto', 'grid', 'grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3',
    'text-3xl', 'text-xl', 'text-lg', 'text-sm', 'text-xs', 'font-light', 'font-semibold', 'font-medium',
    'text-white', 'text-zinc-500', 'text-zinc-400', 'bg-background', 'bg-background-card',
    'rounded-full', 'rounded-2xl', 'rounded-3xl', 'border', 'border-white/10', 'backdrop-blur-xl', 'backdrop-blur-2xl'
  ],
  plugins: [],
}
