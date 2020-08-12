#!/bin/bash

# Exit on error
set -e
# Exit on using an unset variable
set -u

# Symlinks go here so templates can be written without making
#  the docroot writeable
mkdir -p /app/config

# Templates (files that should have `envsubst` run) go here
mkdir -p /app/templates

# Loop over all files that contain one of our variables for templating
for file_path in $(grep -l -E '\$(API|WEB)_URL' /usr/share/nginx/html/*.js); do
  file=$(basename ${file_path})
  echo "Setting up ${file} for templating..."
  mv ${file_path} /app/templates/${file}.template
  ln -s /app/config/${file} ${file_path}
done
