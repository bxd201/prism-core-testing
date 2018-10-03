FROM nginx:alpine

LABEL maintainer="Jonathan Gnagy <jonathan.l.gnagy@sherwin.com>"

ENV API_URL="http://localhost:3000/v1"

COPY dist /usr/share/nginx/html
COPY ci/nginx/docroot /usr/share/nginx/html
COPY ci/nginx/conf.d /etc/nginx/conf.d
COPY ci/scripts/entrypoint.sh /entrypoint.sh

RUN mv /usr/share/nginx/html/bundle.js /usr/share/nginx/html/bundle.js.template \
    && mv /usr/share/nginx/html/bundle.js.map /usr/share/nginx/html/bundle.js.map.template \
    && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK CMD curl --fail http://localhost/ || exit 1
