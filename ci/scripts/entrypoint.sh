#!/bin/sh

envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/bundle.js.template > /usr/share/nginx/html/bundle.js
envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/author.js.template > /usr/share/nginx/html/author.js
envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/embed.js.template > /usr/share/nginx/html/embed.js

exec nginx -g "daemon off;"
