#!/bin/sh

mkdir packages/toolkit/dev-public || exit $?
yarn install || exit $?

if [ -n "$DANGER_MANUAL_PR_NUM" ]; then
  yarn danger ci
fi

NODE_ENV=test yarn test || exit $?
# commenting out for now because causing the build to take 2+ hours to run!!
# yarn facets:e2e
yarn run build || exit $?

tar zcf dist.tgz packages/facets/dist packages/toolkit/dist packages/toolkit/public packages/prism-docs/build packages/prism-demo/build packages/toolkit/coverage/lcov-report
