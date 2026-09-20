/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        burgundy: "#801B2B",
        gold: "#D4AF37",
      },
      fontFamily: {
        tiro: ['"Tiro Devanagari Sanskrit"', 'serif'],
        poppins: ['"Poppins"', 'sans-serif'],
        shree5021: ['"ShreeDev5021"', 'sans-serif'],
        palanquin: ['"Palanquin Dark"', 'sans-serif'],
        shree2492: ['"ShreeDev2492"', 'sans-serif'],
        noto: ['"Noto Serif Devanagari"', 'serif'],
        yatra: ['"Yatra One"', 'cursive'],
        bakbak: ['"Bakbak One"', 'cursive'],
        sahitya: ['"Sahitya"', 'serif'],
        alkatra: ['"Alkatra"', 'cursive'],
      },
    },
  },
  plugins: [],
}

