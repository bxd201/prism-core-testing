const path = require('path')

module.exports = {
  stories: ['../src/components/**/*.stories.@(tsx|mdx)', '../src/stories/**/*.stories.@(tsx|mdx)'],
  // Add any Storybook addons you want here: https://storybook.js.org/addons/
  addons: ['@storybook/addon-essentials', './addons/testTab/register', '@storybook/preset-create-react-app'],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\,css&/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: [require('tailwindcss'), require('autoprefixer')]
          }
        }
      ],
      include: path.resolve(__dirname, '../')
    })
    return config
  },
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true)
    }
  },
  core: { builder: 'webpack5' }
}
