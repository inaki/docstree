/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./**/*.{ts,tsx,js,jsx,html}",
    "!./node_modules/**/*",
    "!./.plasmo/**/*",
    "!./build/**/*"
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--color-surface)",
        "surface-weak": "var(--color-surface-weak)",
        ink: "var(--color-ink)",
        "ink-weak": "var(--color-ink-weak)",
        border: "var(--color-border)",
        accent: "var(--color-accent)"
      },
      boxShadow: {
        pop: "var(--shadow-pop)"
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)"
      }
    }
  },
  plugins: []
}
