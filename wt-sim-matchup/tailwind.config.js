/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Military briefing theme — matte dark with amber/gold accents
        'aviation': {
          charcoal: '#0d0f11',
          slate: '#171b20',
          'slate-light': '#1e2328',
          amber: '#d4a843',
          'amber-dark': '#b8922e',
          'amber-light': '#e8c368',
          text: '#e2e4e8',
          'text-muted': '#6b7280',
          border: '#2a2f36',
          surface: '#1a1e23',
        },
        // Nation-specific colors
        'nation': {
          usa: '#4a90d9',
          germany: '#9a9a9a',
          ussr: '#e04444',
          britain: '#5b7ec9',
          japan: '#e05050',
          italy: '#3aad55',
          france: '#5a70cc',
          china: '#dd3838',
          sweden: '#3ea5dd',
          israel: '#5588ee',
        },
      },
      fontFamily: {
        'header': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'tilt': 'tilt 0.3s ease-in-out',
        'fill': 'fill 0.6s ease-out forwards',
      },
      keyframes: {
        tilt: {
          '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(0.5deg) scale(1.01)' },
        },
        fill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--fill-width)' },
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        'card-lg': '0 4px 16px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
