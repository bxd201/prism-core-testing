#!/bin/sh

# Loop over all template files
for file_path in $(ls -1 /app/templates/*.js.template); do
  file=$(basename ${file_path} .template)
  echo "Templating ${file}..."

  envsubst '$API_URL:$WEB_URL' < /app/templates/${file}.template > /app/config/${file}
done

exec nginx -g "daemon off;"
