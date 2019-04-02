#!/bin/sh

NODE_ENV=development npm ci || exit $?
npm run test:ci || exit $?
npm run build || exit $?
tar zcf dist.tgz dist
