const path = require('path')

module.exports = {
  test: /\.(js|jsx)$/,
  exclude: /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser))/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        configFile: path.resolve(__dirname, '../.babelrc')
      }
    },
    'eslint-loader'
  ],
  resolve: { extensions: [ '.js', '.jsx' ] }
}
