#!/bin/sh

yarn install || exit $?
NODE_ENV=test yarn toolkit:test || exit $?
yarn run build || exit $?
tar zcf dist.tgz packages/facets/dist packages/toolkit/dist packages/toolkit/public packages/prism-docs/build packages/prism-demo/build packages/toolkit/coverage/lcov-report
