#!/bin/sh

NODE_ENV=development npm ci || exit $?
npm test -- -u || exit $?
npm run build || exit $?
tar zcf dist.tgz dist
