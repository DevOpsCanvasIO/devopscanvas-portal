FROM nginx:alpine

# Copy a simple index page
RUN echo '<html><body><h1>DevOpsCanvas Portal</h1><p>Portal is running!</p></body></html>' > /usr/share/nginx/html/index.html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]