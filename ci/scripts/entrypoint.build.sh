#!/bin/sh

mkdir packages/toolkit/dev-public || exit $?
yarn install || exit $?

if [ -n "$DANGER_MANUAL_PR_NUM" ]; then
  yarn danger ci
fi

NODE_ENV=test yarn test || exit $?
yarn facets:e2e-ci || exit $?
yarn run build || exit $?

tar zcf dist.tgz packages/facets/dist packages/toolkit/dist packages/toolkit/public packages/prism-docs/build packages/prism-demo/build packages/toolkit/coverage/lcov-report
