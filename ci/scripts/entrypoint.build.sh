#!/bin/sh

cp ci/templates/endpoints.jsx.template src/constants/endpoints.jsx
NODE_ENV=development npm install || exit $?
npm run build || exit $?
tar zcf dist.tgz dist
