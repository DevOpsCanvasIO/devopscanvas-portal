# Simplified Backstage build
FROM node:20-bookworm-slim

# Set Python interpreter for `node-gyp` to use
ENV PYTHON=/usr/bin/python3

# Install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 g++ build-essential libsqlite3-dev curl && \
    rm -rf /var/lib/apt/lists/*

# This switches many Node.js dependencies to production mode.
ENV NODE_ENV=production

# This disables node snapshot for Node 20 to work with the Scaffolder
ENV NODE_OPTIONS="--no-node-snapshot"

WORKDIR /app

# Copy everything
COPY . .

# Install yarn
RUN npm install -g yarn

# Install dependencies and build
RUN yarn install --frozen-lockfile && \
    yarn tsc && \
    yarn build:backend

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 7007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:7007/healthcheck || exit 1

# Start the backend
CMD ["yarn", "workspace", "backend", "start"]