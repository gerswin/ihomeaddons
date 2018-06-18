ARG BUILD_FROM=hassioaddons/base-amd64:1.4.1
FROM ${BUILD_FROM}

# Setup base
WORKDIR /usr/bin/sonoff
RUN \
    apk add --no-cache --virtual .build-dependencies \
        g++ \
        make \
        openssl-dev \
        python \
    \
    && apk add --no-cache \
        dbus \
        git \
        nodejs \
        nodejs-npm \
    \
    && npm set unsafe-perm true \
    \
    && npm -g install \
        node-gyp \
        pm2 \
        
    \
    && npm install \
    \
    && apk del --purge .build-dependencies

# Copy root filesystem
COPY rootfs /

COPY sonoff.config.json /config/
COPY sonoff.devices.json /config/
COPY sonoff.ha.devices.json /config/

# Scrip to run after startup
CMD [ "/usr/bin/run.sh" ]

# Build arugments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_REF
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="Sonoff" \
    io.hass.description="Sonoff devices for Home Assistant" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Franck Nijhof <frenck@addons.community>" \
    org.label-schema.description="Sonoff devices for Home Assistant" \
    org.label-schema.build-date=${BUILD_DATE} \
    org.label-schema.name="Sonoff" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.url="https://community.home-assistant.io/t/community-hass-io-add-on-homebridge/33803?u=frenck" \
    org.label-schema.usage="https://github.com/hassio-addons/addon-homebridge/tree/master/README.md" \
    org.label-schema.vcs-ref=${BUILD_REF} \
    org.label-schema.vcs-url="https://github.com/gerswin/ihomeaddons" \
    org.label-schema.vendor="gerswin Hass.io Add-ons"