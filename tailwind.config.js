/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}",  "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        btn: {
          background: "hsl(var(--btn-background))",
          "background-hover": "hsl(var(--btn-background-hover))",
        },

        // Custom colors
        royalBlue: {
          DEFAULT: "#4169E1",
          hover: "#345BB0",
        },
        customLightBlue: {
          DEFAULT: "#05ACDF",
          hover: "#0490B8",
          light: "#E6F7FF",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require('flowbite/plugin')],
};
