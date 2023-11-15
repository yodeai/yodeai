/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}",  "./node_modules/flowbite/**/*.js"],
  plugins: [require("@tailwindcss/typography"), require('flowbite/plugin')],
  corePlugins: {
    preflight: false,
  }
};
