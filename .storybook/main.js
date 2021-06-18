const path = require("path")
const toPath = (_path) => path.join(process.cwd(), _path)

module.exports = {
  stories: ['../**/*.stories.@(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  typescript: {
    check: true,
    reactDocgen: 'react-docgen'
  },
  reactOptions: {
    fastRefresh: true,
  },
  webpackFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          "@emotion/core": toPath("node_modules/@emotion/react"),
          "emotion-theming": toPath("node_modules/@emotion/react"),
        },
      },
    }
  },
};
