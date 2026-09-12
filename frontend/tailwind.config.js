/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        amazonBlue: "#131921",
        amazonBlueLight: "#232f3e",
        amazonYellow: "#febd69",
        amazonOrange: "#f08804",
      },
    },
  },
  plugins: [],
}
