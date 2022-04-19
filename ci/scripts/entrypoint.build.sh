#!/bin/sh

yarn install || exit $?
yarn run build || exit $?
tar zcf dist.tgz packages/facets/dist packages/toolkit/dist packages/toolkit/public
