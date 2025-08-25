/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // START: Add your custom colors here
      colors: {
        // Primary brand with gradient endpoints
        primary: {
          DEFAULT: '#713ABE',
          start: '#6B46C1',
          end: '#9F7AEA',
        },
        // Background / surfaces
        background: '#F1F5F9',
        content: '#FFFFFF',

        // Text tokens (provide both short and component-friendly keys)
        'text-primary': '#334155',
        'text-secondary': '#CBD5E1',
        'text-text-primary': '#334155',
        'text-text-secondary': '#CBD5E1',

        // Success / error with gradient endpoints for destructive buttons
        success: {
          DEFAULT: '#22C55E',
        },
        error: {
          DEFAULT: '#EF4444',
          start: '#f87171',
          end: '#ef4444',
        },
      },
      // Animation configurations for Radix UI components
      keyframes: {
        in: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        out: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
      animation: {
        in: 'in 200ms ease-in-out',
        out: 'out 150ms ease-in-out',
      },
      // END: Custom colors
    },
  },
  plugins: [],
}