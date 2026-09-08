/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0A1A12',
          soft: '#163326',
          muted: '#5A6F62',
          inverse: '#ECF3EF',
          'muted-inverse': '#9BB0A4',
        },
        canvas: {
          DEFAULT: '#F0F5F1',
          elev: '#F7FAF8',
          dark: '#0B1410',
          'elev-dark': '#101C16',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#15241C',
        },
        brand: {
          DEFAULT: '#0E7A42',
          dark: '#084828',
          light: '#14964F',
          accent: '#8CC458',
          mist: '#E3F3E9',
          'mist-dark': '#143528',
          black: '#000000',
        },
        signal: {
          DEFAULT: '#D97706',
          soft: '#FEF3C7',
          'soft-dark': '#3D2E12',
        },
        line: {
          DEFAULT: '#D0DED5',
          dark: '#2A3F34',
        },
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
