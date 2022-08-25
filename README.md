#PRISM

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

## Versioning Steps

After `develop` code freeze is over, we need to increment the versions of the application in order to preserve the previous
version's code in it's `develop` variant in S3.

1. Update the version in the root of the project.
2. Update the version in each package's `package.json`
3. Ensure/update the version of `@prism/toolkit` in each package's `package.json` to ensure it aligns with the current version.
4. Ensure/update the version of `@prism/demo` in each package's `package.json` to ensure it aligns with the current version.

## Legacy Documentation

Migrating up the legacy documentation for `prism-lib` and `prism-core` up to the top level is still in a work in progress.

[@prism/facets (formerly known as prism-core) documentation](packages/facets/README.md)<br />
[@prism/toolkit (formerly known as prism-lib) documentation](packages/toolkit/README.md)
