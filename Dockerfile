# Real Backstage Build with Corepack
FROM node:20-bookworm-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 g++ build-essential libsqlite3-dev curl git \
    && rm -rf /var/lib/apt/lists/*

# Enable Corepack for proper Yarn version management
RUN corepack enable

ENV PYTHON=/usr/bin/python3
ENV NODE_OPTIONS="--no-node-snapshot"
ENV NODE_ENV=development

WORKDIR /app

# Copy package.json and yarn.lock first for better caching
COPY package.json yarn.lock ./

# Copy workspace package.json files
COPY packages/app/package.json ./packages/app/
COPY packages/backend/package.json ./packages/backend/
COPY packages/plugins/package.json ./packages/plugins/

# Prepare Yarn version from packageManager field
RUN corepack prepare

# Verify Yarn version
RUN yarn --version

# Install dependencies with proper Yarn version
RUN yarn install --immutable

# Copy the rest of the source code
COPY . .

# Build both frontend and backend
RUN yarn build:backend
RUN yarn workspace app build

# Switch to production mode
ENV NODE_ENV=production

# Copy built frontend to backend static directory
RUN mkdir -p packages/backend/dist/static
RUN cp -r packages/app/dist/* packages/backend/dist/static/

# Security: create and use non-root user
RUN groupadd -r backstage && useradd -r -g backstage backstage
RUN chown -R backstage:backstage /app
USER backstage

# Expose port
EXPOSE 7007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7007/healthcheck || exit 1

# Start the Backstage backend with production config
CMD ["node", "packages/backend/dist", "--config", "app-config.yaml", "--config", "app-config.production.yaml"]