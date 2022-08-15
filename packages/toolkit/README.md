# Prism Toolkit &nbsp; [![release](https://img.shields.io/badge/release-v3.2.0-blue)]()

React components styled with [tailwind](https://tailwindcss.com/). See available components [here](https://internal-prism.sherwin-williams.com/storybook/toolkit/)

### NPM
```bash
npm install @prism/toolkit --registry=https://artifactory.sherwin.com/artifactory/api/npm/sherwin-npm-virtual/
```

### Yarn
```bash
yarn add @prism/toolkit --registry=https://artifactory.sherwin.com/artifactory/api/npm/sherwin-npm-virtual/
```

<!-- registry=https://artifactory.sherwin.com/artifactory/api/npm/sherwin-npm-virtual/ -->

## How to use in Tailwind projects

Add `node_modules/@prism/toolkit/index.js` to the list of purged files in your `tailwind.config.js`

```JSX
import react from 'react'
import { Component } from '@prism/toolkit'

export default () => <Component {...} />
```

To override the default prism [theme](#available-theme-variables) you can place the `Prism` component higher up in the component hiearchy and provide it with a new theme object

```JSX
import react from 'react'
import { Component } from '@prism/toolkit'

export default () => (
  <Prism
    theme={{
      '--prism-theme-color-primary': '#123456',
      '--prism-theme-color-secondary': '#234567'
    }}
  >
    <Component {...} />
  </Prism>
)
```

## How to use outside of Tailwind projects

To use prism-lib outside of a tailwind project you must import the prism-lib css file somewhere in your project

```js
import '@prism/toolkit/dist/index.css'
```

All styles are prefixed with `.prism` to avoid collisions outside of prism components so every component must have a `div.prism` higher up in the component hiearchy. We recommend wrapping components with the `Prism` component to automatically do this for you.

```JSX
import react from 'react'
import Prism, { Component } from '@prism/toolkit'

export default () => (
  <Prism>
    <Component {...} />
  </Prism>
)
```

To provide your own [theme](#available-theme-variables) you can pass a theme object to the `Prism` component

```JSX
import react from 'react'
import Prism, { Component } from '@prism/toolkit'

export default () => (
  <Prism
    theme={{
      '--prism-theme-color-primary': '#123456',
      '--prism-theme-color-secondary': '#234567'
    }}
  >
    <Component {...} />
  </Prism>
)
```

Your project's global styles may be overriden inside of a `Prism` context. So if your project relies heavily on global reset styles, we recommend keeping `Prism` and it's components closely coupled in the component Hiearchy

## Available theme variables

| variable name                         | default value             |
| ------------------------------------- | ------------------------- |
| `--prism-theme-color-primary`         | `#0069af`                 |
| `--prism-theme-color-secondary`       | `#2cabe2`                 |
| `--prism-theme-color-black`           | `#000`                    |
| `--prism-theme-color-near-black`      | `#2e2e2e`                 |
| `--prism-theme-color-grey`            | `#cccccc`                 |
| `--prism-theme-color-light-grey`      | `#dddddd`                 |
| `--prism-theme-color-light-lightest`  | `#fafafa`                 |
| `--prism-theme-color-white`           | `#FFF`                    |
| `--prism-theme-color-success`         | `#1fce6d`                 |
| `--prism-theme-color-warning`         | `#f2c500`                 |
| `--prism-theme-color-danger`          | `#e94b35`                 |
| `--prism-theme-color-error`           | `#e94b35`                 |
| `--prism-typography-body-font-family` | `'Open Sans', sans-serif` |

<br /><br />

# Contributing

Welcome to PRISM Toolkit development! Thanks in advance for your contributions.

### How to report a bug or request a feature

- Look at the [open and closed issues](https://github.sherwin.com/SherwinWilliams/prism-lib/issues?q=is%3Aissue) to see if this has been discussed before. If you can't find anything, feel free to open a new issue.

### How to contribute

- Look at the open, unassigned issues. Consider describing your implementation plans in the issue comments. Make sure to assign yourself to the issue when ready to begin the work.
- Avoid unnecessary commits or merge commits in your PRs. [Squash commits](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) whenever possible.
- [Rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing) (instead of merge) outdated PRs on the develop branch.
- Lint and test your changes before opening a PR using `yarn test`. We recommend using an IDE plugin to automatically lint on save (vscode plugins: [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Flow Language Support](https://marketplace.visualstudio.com/items?itemName=flowtype.flow-for-vscode) - set `javascript.validate.enable` settings option to `false`).
- Each PR must be reviewed by at least one senior dev. Request their review in the PR and assign it to them.
- Add on PR deployed static site changes url by running `yarn run deploy`.
- We use prettier and recommend setting up an IDE plugin to automatically format on save ([Prettier VSCode plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)). Files are automatically formatted on commit in case you don't install the plugin.

### Tests

- Create tests based on [documentation / best practices](https://sherwin-williams.atlassian.net/wiki/spaces/ECOMM/pages/763789617/PRISM2+Testing).
- Test report: `yarn test`.
- Debug failing tests and see Cypress UI by running: `yarn run cypress`.
