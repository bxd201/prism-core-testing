#!/bin/sh

NODE_ENV=development npm install || exit $?
npm run build || exit $?
tar zcf dist.tgz dist
