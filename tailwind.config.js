/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{ts,tsx,js,jsx,html}",
    "!./node_modules/**/*",
    "!./.plasmo/**/*",
    "!./build/**/*"
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
