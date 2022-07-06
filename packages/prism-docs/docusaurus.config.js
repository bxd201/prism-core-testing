// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const pkg = require('./package.json')

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'PRISM',
  tagline: 'Digital Color Team',
  url: 'https://prism.sherwin-williams.com',
  baseUrl: '/docs/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'sherwin-williams', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath:'/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: ['@docusaurus/theme-live-codeblock'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      liveCodeBlock: {
        playgroundPosition: 'top', //top | bottom
      },
      navbar: {
        title: 'PRISM',
        logo: {
          alt: 'Digital Color Tools Logo',
          src: 'img/dct_logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'getting-started',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://prism.sherwin-williams.com/demo/index.html',
            position: 'right',
            label: 'Demo',
          },
          {
            href: 'https://github.sherwin.com/SherwinWilliams/prism-core',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: `https://prism.sherwin-williams.com/${pkg.version}-develop/index.html`,
            label: `v${pkg.version}`,
            position: 'right',
          },
        ],
      },
      footer: {
        // style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/getting-started',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Confluence',
                href: 'https://sherwin-williams.atlassian.net/wiki/spaces/ECOMM/pages/3645386/Digital+Color+Team',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.sherwin.com/SherwinWilliams/prism-core',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sherwin-Williams.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
