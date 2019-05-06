FROM nginx:stable

LABEL maintainer="Jonathan Gnagy <jonathan.l.gnagy@sherwin.com>"

ENV API_URL="$API_URL"
ENV WEB_URL="$WEB_URL"

COPY dist /usr/share/nginx/html
COPY ci/nginx/docroot /usr/share/nginx/html
COPY ci/nginx/conf.d /etc/nginx/conf.d
COPY ci/scripts/entrypoint.sh /entrypoint.sh

RUN mv /usr/share/nginx/html/bundle.js /usr/share/nginx/html/bundle.js.template \
    && mv /usr/share/nginx/html/author.js /usr/share/nginx/html/author.js.template \
    && mv /usr/share/nginx/html/embed.js /usr/share/nginx/html/embed.js.template \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK CMD curl --fail http://localhost/ || exit 1
