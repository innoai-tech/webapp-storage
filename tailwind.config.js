/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: { preflight: false },
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  plugins: [],
};
