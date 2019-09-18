#!/bin/sh

envsubst '$API_URL:$WEB_URL' < /app/templates/bundle.js.template > /app/config/bundle.js
envsubst '$API_URL:$WEB_URL' < /app/templates/author.js.template > /app/config/author.js
envsubst '$API_URL:$WEB_URL' < /app/templates/embed.js.template > /app/config/embed.js

exec nginx -g "daemon off;"
