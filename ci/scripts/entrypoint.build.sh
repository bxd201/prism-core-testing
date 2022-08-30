#!/bin/sh

mkdir packages/toolkit/dev-public || exit $?
yarn install || exit $?

if [ -n "$DANGER_MANUAL_PR_NUM" ]; then
  yarn danger ci
fi

NODE_ENV=test yarn test || exit $?
yarn run build || exit $?

# TODO: Only running Cypress on PR building for right now in case it's causing issues with deployment/build since it involves a yarn start
if [ -n "$DANGER_MANUAL_PR_NUM" ]; then
  yarn facets:cypress
fi

tar zcf dist.tgz packages/facets/dist packages/toolkit/dist packages/toolkit/public packages/prism-docs/build packages/prism-demo/build packages/toolkit/coverage/lcov-report
