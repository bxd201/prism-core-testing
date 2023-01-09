const path = require('path')

module.exports = {
  test: /\.(js|jsx|ts|tsx)$/,
  exclude:
    /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|@firebase|@fortawesome\/react-fontawesome))/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        configFile: path.resolve(__dirname, '../.babelrc')
      }
    }
  ],
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }
}
