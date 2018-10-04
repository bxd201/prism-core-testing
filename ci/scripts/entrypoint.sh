#!/bin/sh

envsubst '$API_URL' < /usr/share/nginx/html/bundle.js.template > /usr/share/nginx/html/bundle.js
envsubst '$API_URL' < /usr/share/nginx/html/bundle.js.map.template > /usr/share/nginx/html/bundle.js.map

exec nginx -g "daemon off;"
