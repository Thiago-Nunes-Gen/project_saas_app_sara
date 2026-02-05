/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nova paleta Gênesis
        primary: {
          50: '#f3f4fb',
          100: '#e8e9f7',
          200: '#d5d8f0',
          300: '#aab2e8', // Lilás claro da paleta
          400: '#7b86d9',
          500: '#3d9af4', // Azul brilhante da paleta
          600: '#23639f', // Azul médio da paleta
          700: '#2d1856', // Roxo médio da paleta
          800: '#21154d', // Roxo escuro da paleta
          900: '#210222', // Roxo muito escuro da paleta
        },
        sara: {
          bg: '#FAFAFA',
          card: '#FFFFFF',
          border: '#E5E7EB',
          text: '#1A1A1A',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        // Cores específicas da marca Gênesis
        genesis: {
          purple: {
            dark: '#21154d',
            DEFAULT: '#2d1856',
            light: '#aab2e8',
            darker: '#210222',
          },
          blue: {
            DEFAULT: '#23639f',
            light: '#3d9af4',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
