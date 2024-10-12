const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require('tailwindcss/colors')
const color = require('color')

const lighen = (clr, val) => color(clr).lighten(val).rgb().string();
const darken = (clr, val) => color(clr).darken(val).rgb().string();

const primaryColor = "#f8bb15";

module.exports = {
  content: [
    "./src/**/*.{js,jsx,mdx,md}",
  ],
  theme: {
    extend: {
      screens: {
        "xl": "1380px",
      },      
      typography: {
        primary: {
          css: {
            "--tw-prose-links": darken(primaryColor, .2),
          },
        },
      },
      colors: {
        gray: colors.neutral,
        primary: {
          "light": lighen(primaryColor, .2),
          "DEFAULT": primaryColor,
          "dark": darken(primaryColor, .2),
        },
      },      
      fontFamily: {
        "logo": ["Slabo\\ 27px", ...defaultTheme.fontFamily.serif],
        "sans": ["Open\\ Sans", ...defaultTheme.fontFamily.sans],
        "serif": ["Bree\\ Serif", ...defaultTheme.fontFamily.serif],
        "mono": ["Source\\ Code\\ Pro", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        "primary-b": `rgb(248, 187, 21) 0px -6px 0px 0px inset`
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
