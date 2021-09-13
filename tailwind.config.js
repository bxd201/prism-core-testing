module.exports = {
  corePlugins: {
    preflight: false
  },
  purge: [
    './src/**/*.jsx',
    './src/**/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: []
}
