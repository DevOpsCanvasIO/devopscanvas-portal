# Simplified Working Backstage Build
FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 g++ build-essential libsqlite3-dev curl git \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHON=/usr/bin/python3
ENV NODE_OPTIONS="--no-node-snapshot"
ENV NODE_ENV=development

WORKDIR /app

# Copy everything (simpler approach)
COPY . .

# Install dependencies
RUN yarn install

# Build the backend
RUN yarn tsc && yarn build:backend

# Switch to production mode
ENV NODE_ENV=production

# Security: create and use non-root user
RUN groupadd -r backstage && useradd -r -g backstage backstage
RUN chown -R backstage:backstage /app
USER backstage

# Expose port
EXPOSE 7007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7007/healthcheck || exit 1

# Start the Backstage backend
CMD ["node", "packages/backend/dist", "--config", "app-config.yaml"]