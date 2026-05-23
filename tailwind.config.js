/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102033',
        muted: '#66768c',
        line: '#d8e0ea',
        panel: '#f8fafc',
        brand: '#d11b3d',
        teal: '#0f9f8f',
        amber: '#b7791f',
        danger: '#c2410c'
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
