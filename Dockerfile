FROM docker.artifactory.sherwin.com/ecomm/utils/moldy-nginx:latest

LABEL maintainer="Justis Estell <justis.f.estell@sherwin.com>"

ENV API_URL="$API_URL"
ENV WEB_URL="$WEB_URL"

COPY dist /usr/share/nginx/html
COPY ci/nginx/docroot /usr/share/nginx/html
COPY ci/nginx/conf.d /etc/nginx/conf.d
COPY ci/scripts/entrypoint.sh /entrypoint.sh
COPY ci/scripts/position_templates.sh /position_templates.sh

RUN apk add gettext bash \
    && chmod +x /entrypoint.sh

RUN chmod +x /position_templates.sh \
    && /position_templates.sh \
    && rm /position_templates.sh

ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK CMD curl --fail http://localhost/ || exit 1
