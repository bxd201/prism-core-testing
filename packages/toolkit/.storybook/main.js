const postCssConfig = require('../postcss.config')

module.exports = {
  stories: ['../src/components/**/*.stories.tsx'],
  // Add any Storybook addons you want here: https://storybook.js.org/addons/
  addons: ['@storybook/addon-essentials', './addons/testTab/register', '@storybook/preset-create-react-app'],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: postCssConfig
          }
        }
      ]
    })
    return config
  },
  core: { builder: 'webpack5' }
}
