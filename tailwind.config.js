module.exports = {
  purge: {
    enabled: process.env.HUGO_ENVIRONMENT === "production",
    content: ["./layouts/**/*.html", "./content/**/*.md", "./content/**/*.html"],
    safelist: ['stroke-current']
  },
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        normaltext: 'rgba(0, 0, 0, 0.87)',
        darkbg: '#121212',
        darktext: 'rgba(255, 255, 255, 0.87)',
        prompt: '#ff6ac1',
        mediumemphasis: 'rgba(0, 0, 0, 0.6)',
        darkmediumemphasis: 'rgba(255, 255, 255, 0.6)',
        codedark: 'rgb(40, 42, 54)',
      },
      screens: {
        'mobile': '428px',
        'xs': '613px',
      },
    },
  },
  variants: {
    extend: {
      margin: ['last']
    },
  },
  plugins: [],
}
