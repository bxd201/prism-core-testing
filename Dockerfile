FROM docker.cpartdc01.sherwin.com/ecomm/utils/moldy-nginx:latest

LABEL maintainer="Justis Estell <justis.f.estell@sherwin.com>"

ENV API_URL="$API_URL"
ENV WEB_URL="$WEB_URL"

COPY dist /usr/share/nginx/html
COPY ci/nginx/docroot /usr/share/nginx/html
COPY ci/nginx/conf.d /etc/nginx/conf.d
COPY ci/scripts/entrypoint.sh /entrypoint.sh

RUN apk add gettext \
    && chmod +x /entrypoint.sh

RUN mkdir -p /app/config \
    && mkdir /app/templates \
    && mv /usr/share/nginx/html/bundle.js /app/templates/bundle.js.template \
    && mv /usr/share/nginx/html/author.js /app/templates/author.js.template \
    && mv /usr/share/nginx/html/embed.js /app/templates/embed.js.template

RUN ln -s /app/config/bundle.js /usr/share/nginx/html/bundle.js \
    && ln -s /app/config/author.js /usr/share/nginx/html/author.js \
    && ln -s /app/config/author.js /usr/share/nginx/html/embed.js

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK CMD curl --fail http://localhost/ || exit 1
