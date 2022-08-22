module.exports = (ctx) => {
  const { options = {} } = ctx
  return {
    plugins: {
      tailwindcss: {
        config: options.tailwindConfig
      },
      'postcss-nested': {},
      'postcss-focus-visible': {},
      autoprefixer: {}
    }
  }
}
