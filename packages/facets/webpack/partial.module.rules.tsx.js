const flags = require('./constants')
const path = require('path')

const removeGlobalLodash = function (match, pl, offset, string) {
  console.info(`Replacing ${match} in file ${this.resource}`)
  return '/* window._ redacted */'
}

module.exports = [
  {
    test: /\.worker\.js$/,
    exclude:
      /node_modules\/(?!(react-intl|intl-messageformat|intl-messageformat-parser|@firebase|@fortawesome\/react-fontawesome))/,
    include: flags.srcPath,
    use: [
      {
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback'
        }
      },
      {
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, '../.babelrc')
        }
      }
    ]
  },
  {
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
  },
  {
    // NOTE: this is done to specifically target the places in lodash's source files where it is setting itself
    // as _ in the global environment. obviously we shouldn't be leaking this sort of thing into the broader environment.
    test: /lodash/,
    loader: 'string-replace-loader',
    options: {
      multiple: [
        {
          search: /root\._ = _;/g,
          replace: removeGlobalLodash
        },
        {
          search: /root\._ = lodash;/g,
          replace: removeGlobalLodash
        }
      ]
    }
  }
]
