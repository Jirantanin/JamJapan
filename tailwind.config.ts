import type { Config } from 'tailwindcss'

export default <Config>{
  content: [],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa2a2',
          400: '#fd6c6c',
          500: '#f53e3e',
          600: '#e22020',
          700: '#be1717',
          800: '#9d1717',
          900: '#821a1a',
          950: '#470808',
        },
        sakura: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },
      },
      fontFamily: {
        sans: ['Noto Sans Thai', 'Noto Sans JP', 'sans-serif'],
      },
    },
  },
}
