/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1F2A',
          soft: '#1A3340',
          muted: '#5B6B75',
        },
        canvas: {
          DEFAULT: '#EEF3F5',
          elev: '#F7FAFB',
        },
        brand: {
          DEFAULT: '#146C6A',
          dark: '#0E5251',
          light: '#1A8A87',
          mist: '#D7EDED',
        },
        signal: {
          DEFAULT: '#D97706',
          soft: '#FEF3C7',
        },
        line: '#D4DEE3',
      },
      fontFamily: {
        display: ['Outfit_600SemiBold'],
        displayBold: ['Outfit_700Bold'],
        sans: ['SourceSans3_400Regular'],
        sansMedium: ['SourceSans3_500Medium'],
        sansSemi: ['SourceSans3_600SemiBold'],
      },
    },
  },
  plugins: [],
};
