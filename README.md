# PRISM

## Getting Started

1. Install NVM (https://github.com/nvm-sh/nvm)
2. Navigate to project directory and install node `nvm use` (this will install the version specified in `.nvmrc`)
3. Enable node corepack `corepack enable`
4. Install dependencies `yarn install`
5. Start `@prism/facets` (current default) application `yarn start`

### Storybook

Currently we have two instances of storybook due to the nature migrating `@prism/toolkit` into the same repsitory.

To run the the relative instances of storybook..

```
yarn facets:storybook
yarn toolkit:storybook
```

## Release Steps

1. Run `changeset version`
2. Update the root `package.json` version to the new version that was set in Step 1.

## Legacy Documentation

Migrating up the legacy documentation for `prism-lib` and `prism-core` up to the top level is still in a work in progress.

[@prism/facets (formerly known as prism-core) documentation](packages/facets/README.md)<br />
[@prism/toolkit (formerly known as prism-lib) documentation](packages/toolkit/README.md)

## Issues

### Yarn keeps failing

Inspect the log file that the yarn failure is outputting. If it looks something like this...

```
----------

URL: https://download.cypress.io/desktop/10.6.0?platform=darwin&arch=x64
Error: self signed certificate in certificate chain

----------
```

That means zscaler is blocking the download and installation of Cypress. To resolve...

1. Download Cypress directly https://download.cypress.io/desktop/10.6.0?platform=darwin&arch=x64
2. Create Cypress dir `mkdir ~/Library/Caches/Cypress/10.6.0`
3. Open that directory `open ~/Library/Caches/Cypress/10.6.0`
4. Unzip the Cypress app from zip file that was downloaded in step 1 into that directory
