/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#001f3f",
        secondary: "#FFD444",
        "text-dark": "#1a1a1a",
        "text-light": "#5f6368",
        "bg-base": "#f0f4f8",
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
