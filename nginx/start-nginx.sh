#!/bin/sh

# Substitute environment variables in the template file
envsubst '$RATE_LIMIT' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start NGINX
nginx -g 'daemon off;'