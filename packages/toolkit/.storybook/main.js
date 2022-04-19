module.exports = {
  staticDirs: ['../dev-public'],
  stories: ['../src/components/**/*.stories.tsx'],
  // Add any Storybook addons you want here: https://storybook.js.org/addons/
  addons: ['@storybook/addon-essentials', './addons/testTab/register', '@storybook/preset-create-react-app'],
  webpackFinal: async (config) => {
    config.module.rules.push({ test: /\.css$/, use: ['postcss-loader'] })
    return config
  },
  core: { builder: 'webpack5' }
}
