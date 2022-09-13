module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('postcss-focus-visible'),
    ...(process.env.TOOLKIT_PROTECT_CLASS
      ? [
          require('./local_modules/postcss-root-prefixer')({
            prefix: `.${process.env.TOOLKIT_PROTECT_CLASS}`
          }),
          require('./local_modules/postcss-root-bubbler')
        ]
      : []),
    require('autoprefixer')
  ]
}
