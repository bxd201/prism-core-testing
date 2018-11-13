#!/bin/sh

envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/bundle.js.template > /usr/share/nginx/html/bundle.js
envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/bundle.js.map.template > /usr/share/nginx/html/bundle.js.map

envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/author.js.template > /usr/share/nginx/html/author.js
envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/author.js.map.template > /usr/share/nginx/html/author.js.map

envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/embed.js.template > /usr/share/nginx/html/embed.js
envsubst '$API_URL:$WEB_URL' < /usr/share/nginx/html/embed.js.map.template > /usr/share/nginx/html/embed.js.map

exec nginx -g "daemon off;"
