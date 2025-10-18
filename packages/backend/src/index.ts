import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// App backend plugin
backend.add(import('@backstage/plugin-app-backend/alpha'));

// Auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// Catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(import('@backstage/plugin-permission-backend-module-allow-all-policy'));

// Proxy plugin
backend.add(import('@backstage/plugin-proxy-backend/alpha'));

// Scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));

// Search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-pg/alpha'));

// TechDocs plugin
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));

backend.start();