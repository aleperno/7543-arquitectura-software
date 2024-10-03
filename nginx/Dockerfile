FROM nginx:1.25.4

# Copy the template and script
COPY nginx_template /etc/nginx/nginx.conf.template
COPY start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh

# Set the default environment variable for rate limit
ENV RATE_LIMIT 10

# Use the custom startup script as the entrypoint
ENTRYPOINT ["/usr/bin/start-nginx.sh"]