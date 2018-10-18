#!/bin/sh

cp ci/templates/endpoints.js.template src/constants/endpoints.js
NODE_ENV=development npm install || exit $?
npm run build || exit $?
tar zcf dist.tgz dist
