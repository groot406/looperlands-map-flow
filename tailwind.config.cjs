/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
        'header': ['Roboto', 'sans-serif'],
        'content': ['Lato', 'sans-serif']
      }
    },
  },
  plugins: [],
}
