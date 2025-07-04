/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // continua a usar require mesmo em ESM
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light','dark','cupcake'],
  },
};
