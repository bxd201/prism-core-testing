FROM docker.artifactory.sherwin.com/ecomm/utils/moldy-nginx:latest

LABEL maintainer="Justis Estell <justis.f.estell@sherwin.com>"

RUN mkdir -p /usr/share/nginx/html/storybook/facets
RUN mkdir -p /usr/share/nginx/html/storybook/toolkit
RUN mkdir -p /usr/share/nginx/html/docs
RUN mkdir -p /usr/share/nginx/html/demo
RUN mkdir -p /usr/share/nginx/html/coverage

COPY dist/packages/facets/dist/storybook /usr/share/nginx/html/storybook/facets
COPY dist/packages/toolkit/public /usr/share/nginx/html/storybook/toolkit
COPY dist/packages/prism-docs/build /usr/share/nginx/html/docs
COPY dist/packages/prism-demo/build /usr/share/nginx/html/demo
COPY dist/packages/toolkit/coverage/lcov-report /usr/share/nginx/html/coverage

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
