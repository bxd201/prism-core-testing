#!/bin/sh

# Loop over all template files in root
for file_path in $(ls -1 /app/templates/*.js.template); do
  file=$(basename ${file_path} .template)
  echo "Templating ${file}..."

  envsubst '$API_URL:$WEB_URL' < /app/templates/${file}.template > /app/config/${file}
done

mkdir -p /app/config/js

# Loop over all template files in root/js
for file_path in $(ls -1 /app/templates/js/*.js.template); do
  file=$(basename ${file_path} .template)
  echo "Templating ${file}..."

  envsubst '$API_URL:$WEB_URL' < /app/templates/js/${file}.template > /app/config/js/${file}
done

exec nginx -g "daemon off;"
