const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();
const port = process.env.PORT || 7007;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load DevOpsCanvas catalog data
let catalogEntities = [];
let templateEntities = [];
let orgEntities = [];

try {
  // Load entities from YAML files
  const entitiesYaml = fs.readFileSync(path.join(__dirname, '../examples/entities.yaml'), 'utf8');
  const templatesYaml = fs.readFileSync(path.join(__dirname, '../examples/template/template.yaml'), 'utf8');
  const orgYaml = fs.readFileSync(path.join(__dirname, '../examples/org.yaml'), 'utf8');
  
  // Parse YAML documents
  catalogEntities = yaml.loadAll(entitiesYaml).filter(doc => doc && doc.kind !== 'Template');
  templateEntities = yaml.loadAll(templatesYaml).filter(doc => doc && doc.kind === 'Template');
  orgEntities = yaml.loadAll(orgYaml).filter(doc => doc && (doc.kind === 'User' || doc.kind === 'Group'));
  
  console.log(`✅ Loaded ${catalogEntities.length} catalog entities`);
  console.log(`✅ Loaded ${templateEntities.length} templates`);
  console.log(`✅ Loaded ${orgEntities.length} org entities`);
} catch (error) {
  console.error('❌ Error loading catalog data:', error.message);
  
  // Fallback to basic entities
  catalogEntities = [
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-portal',
        title: 'DevOpsCanvas Portal',
        description: 'Enhanced Backstage developer portal with DevOpsCanvas features'
      },
      spec: {
        type: 'website',
        lifecycle: 'production',
        owner: 'platform-team'
      }
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-control-plane',
        title: 'DevOpsCanvas Control Plane',
        description: 'API backend for DevOpsCanvas platform operations'
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'platform-team'
      }
    }
  ];
}

// Enhanced API Routes

// Backstage Catalog API
app.get('/api/catalog/entities', (req, res) => {
  const { kind, type, owner } = req.query;
  let entities = [...catalogEntities, ...orgEntities];
  
  // Apply filters
  if (kind) {
    entities = entities.filter(e => e.kind === kind);
  }
  if (type && entities.some(e => e.spec?.type)) {
    entities = entities.filter(e => e.spec?.type === type);
  }
  if (owner && entities.some(e => e.spec?.owner)) {
    entities = entities.filter(e => e.spec?.owner === owner);
  }
  
  res.json(entities);
});

// Get specific entity
app.get('/api/catalog/entities/by-name/:kind/:namespace/:name', (req, res) => {
  const { kind, name } = req.params;
  const entity = [...catalogEntities, ...orgEntities].find(
    e => e.kind === kind && e.metadata.name === name
  );
  
  if (entity) {
    res.json(entity);
  } else {
    res.status(404).json({ error: 'Entity not found' });
  }
});

// Backstage Templates API
app.get('/api/scaffolder/v2/templates', (req, res) => {
  res.json(templateEntities);
});

// Get specific template
app.get('/api/scaffolder/v2/templates/:name', (req, res) => {
  const template = templateEntities.find(t => t.metadata.name === req.params.name);
  if (template) {
    res.json(template);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

// DevOpsCanvas Platform API
app.get('/api/devopscanvas/platform/info', (req, res) => {
  res.json({
    name: 'DevOpsCanvas Platform',
    version: '2.1.0',
    environment: 'production',
    features: {
      gitops: true,
      observability: true,
      security: true,
      finops: true
    },
    endpoints: {
      controlPlane: 'http://devopscanvas-control-plane.devopscanvas.svc.cluster.local:3000',
      argocd: 'https://argocd.devopscanvas.io',
      grafana: 'https://grafana.devopscanvas.io',
      prometheus: 'https://prometheus.devopscanvas.io'
    },
    statistics: {
      components: catalogEntities.filter(e => e.kind === 'Component').length,
      systems: catalogEntities.filter(e => e.kind === 'System').length,
      apis: catalogEntities.filter(e => e.kind === 'API').length,
      templates: templateEntities.length,
      users: orgEntities.filter(e => e.kind === 'User').length,
      teams: orgEntities.filter(e => e.kind === 'Group').length
    }
  });
});

// Golden Paths API
app.get('/api/devopscanvas/golden-paths', (req, res) => {
  res.json([
    {
      name: 'microservice',
      title: 'Microservice',
      description: 'Standard microservice with observability and GitOps',
      template: 'devopscanvas-microservice',
      technologies: ['nodejs', 'kubernetes', 'prometheus'],
      maturity: 'stable',
      usage: 'high'
    },
    {
      name: 'frontend',
      title: 'Frontend Application',
      description: 'Modern frontend application with CI/CD',
      template: 'devopscanvas-frontend',
      technologies: ['react', 'typescript', 'kubernetes'],
      maturity: 'stable',
      usage: 'medium'
    },
    {
      name: 'infrastructure',
      title: 'Infrastructure Component',
      description: 'Infrastructure as Code with Terraform',
      template: 'devopscanvas-infrastructure',
      technologies: ['terraform', 'aws', 'kubernetes'],
      maturity: 'beta',
      usage: 'low'
    }
  ]);
});

// Search API
app.get('/api/search/query', (req, res) => {
  const { term, filters } = req.query;
  let results = [...catalogEntities, ...templateEntities, ...orgEntities];
  
  if (term) {
    const searchTerm = term.toLowerCase();
    results = results.filter(entity => 
      entity.metadata.name.toLowerCase().includes(searchTerm) ||
      (entity.metadata.title && entity.metadata.title.toLowerCase().includes(searchTerm)) ||
      (entity.metadata.description && entity.metadata.description.toLowerCase().includes(searchTerm))
    );
  }
  
  res.json({
    results: results.map(entity => ({
      type: 'software-catalog',
      document: {
        title: entity.metadata.title || entity.metadata.name,
        text: entity.metadata.description || '',
        location: `/catalog/${entity.metadata.namespace || 'default'}/${entity.kind.toLowerCase()}/${entity.metadata.name}`
      }
    }))
  });
});

// Tech Radar API
app.get('/api/tech-radar', (req, res) => {
  res.json({
    rings: [
      { id: 'adopt', name: 'ADOPT', color: '#93c47d' },
      { id: 'trial', name: 'TRIAL', color: '#93d2c2' },
      { id: 'assess', name: 'ASSESS', color: '#fbdb84' },
      { id: 'hold', name: 'HOLD', color: '#efafa9' }
    ],
    quadrants: [
      { id: 'languages-frameworks', name: 'Languages & Frameworks' },
      { id: 'tools', name: 'Tools' },
      { id: 'platforms', name: 'Platforms' },
      { id: 'techniques', name: 'Techniques' }
    ],
    entries: [
      {
        id: 'kubernetes',
        title: 'Kubernetes',
        quadrant: 'platforms',
        ring: 'adopt',
        description: 'Container orchestration platform'
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        quadrant: 'languages-frameworks',
        ring: 'adopt',
        description: 'Typed JavaScript for better development experience'
      },
      {
        id: 'backstage',
        title: 'Backstage',
        quadrant: 'tools',
        ring: 'adopt',
        description: 'Developer portal platform'
      },
      {
        id: 'argocd',
        title: 'ArgoCD',
        quadrant: 'tools',
        ring: 'adopt',
        description: 'GitOps continuous delivery'
      },
      {
        id: 'prometheus',
        title: 'Prometheus',
        quadrant: 'tools',
        ring: 'adopt',
        description: 'Monitoring and alerting'
      }
    ]
  });
});

// Service Scorecards API
app.get('/api/scorecards', (req, res) => {
  const components = catalogEntities.filter(e => e.kind === 'Component');
  
  const scorecards = components.map(component => ({
    entity: component.metadata.name,
    scores: {
      security: Math.floor(Math.random() * 30) + 70, // 70-100
      reliability: Math.floor(Math.random() * 25) + 75, // 75-100
      performance: Math.floor(Math.random() * 20) + 80, // 80-100
      documentation: Math.floor(Math.random() * 40) + 60, // 60-100
      testing: Math.floor(Math.random() * 35) + 65 // 65-100
    },
    checks: {
      hasReadme: Math.random() > 0.2,
      hasTests: Math.random() > 0.3,
      hasDocumentation: Math.random() > 0.4,
      hasHealthCheck: Math.random() > 0.1,
      hasMonitoring: Math.random() > 0.2
    },
    lastUpdated: new Date().toISOString()
  }));
  
  res.json(scorecards);
});

// Health Check
app.get('/healthcheck', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'DevOpsCanvas Enhanced Portal',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    type: 'Enhanced Backstage-Compatible Backend',
    features: {
      catalog: true,
      templates: true,
      search: true,
      techRadar: true,
      scorecards: true,
      devopscanvasIntegration: true
    },
    statistics: {
      entities: catalogEntities.length + orgEntities.length,
      templates: templateEntities.length,
      components: catalogEntities.filter(e => e.kind === 'Component').length,
      systems: catalogEntities.filter(e => e.kind === 'System').length
    }
  });
});

// Enhanced Portal UI
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOpsCanvas Developer Portal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #1976d2;
            font-size: 2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-number {
            font-size: 3rem;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 0.5rem;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        .feature-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .feature-card:hover { transform: translateY(-5px); }
        .feature-card h3 {
            color: #1976d2;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }
        .api-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .api-endpoint {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #1976d2;
        }
        .api-endpoint code {
            background: #e3f2fd;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        .platform-links {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }
        .platform-link {
            background: linear-gradient(135deg, #1976d2, #1565c0);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            text-decoration: none;
            text-align: center;
            transition: transform 0.3s ease;
        }
        .platform-link:hover {
            transform: translateY(-2px);
            text-decoration: none;
            color: white;
        }
        .footer {
            text-align: center;
            padding: 2rem;
            color: rgba(255, 255, 255, 0.8);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#1976d2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            DevOpsCanvas Developer Portal
        </h1>
    </div>

    <div class="container">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="components-count">-</div>
                <div>Components</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="templates-count">-</div>
                <div>Templates</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="systems-count">-</div>
                <div>Systems</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="teams-count">-</div>
                <div>Teams</div>
            </div>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <h3>🏗️ Service Catalog</h3>
                <p>Discover and manage all platform services, APIs, and components in one centralized location.</p>
            </div>
            <div class="feature-card">
                <h3>🚀 Service Templates</h3>
                <p>Create new services using proven templates with DevOpsCanvas best practices built-in.</p>
            </div>
            <div class="feature-card">
                <h3>📊 Service Scorecards</h3>
                <p>Monitor service quality, security, and compliance with automated scoring and recommendations.</p>
            </div>
            <div class="feature-card">
                <h3>🔍 Search & Discovery</h3>
                <p>Find services, documentation, and resources across your entire platform ecosystem.</p>
            </div>
            <div class="feature-card">
                <h3>🎯 Tech Radar</h3>
                <p>Track technology adoption and platform standards with our interactive technology radar.</p>
            </div>
            <div class="feature-card">
                <h3>👥 Team Management</h3>
                <p>Organize teams, manage ownership, and track service responsibilities across the platform.</p>
            </div>
        </div>

        <div class="api-section">
            <h2>🔌 Available APIs</h2>
            <div class="api-grid">
                <div class="api-endpoint">
                    <strong>Catalog API</strong><br>
                    <code>GET /api/catalog/entities</code>
                </div>
                <div class="api-endpoint">
                    <strong>Templates API</strong><br>
                    <code>GET /api/scaffolder/v2/templates</code>
                </div>
                <div class="api-endpoint">
                    <strong>Search API</strong><br>
                    <code>GET /api/search/query</code>
                </div>
                <div class="api-endpoint">
                    <strong>Tech Radar API</strong><br>
                    <code>GET /api/tech-radar</code>
                </div>
                <div class="api-endpoint">
                    <strong>Scorecards API</strong><br>
                    <code>GET /api/scorecards</code>
                </div>
                <div class="api-endpoint">
                    <strong>Platform API</strong><br>
                    <code>GET /api/devopscanvas/platform/info</code>
                </div>
            </div>
        </div>

        <div class="api-section">
            <h2>🌐 DevOpsCanvas Platform</h2>
            <div class="platform-links">
                <a href="https://github.com/DevOpsCanvasIO" class="platform-link">
                    📚 GitOps Repository
                </a>
                <a href="https://grafana.devopscanvas.io" class="platform-link">
                    📊 Observability
                </a>
                <a href="/api/catalog/entities?kind=Component&type=security" class="platform-link">
                    🔒 Security
                </a>
                <a href="/api/devopscanvas/platform/info" class="platform-link">
                    💰 FinOps
                </a>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>DevOpsCanvas Developer Portal v2.1.0 | Enhanced Backstage-Compatible Backend</p>
    </div>

    <script>
        // Load platform statistics
        fetch('/api/devopscanvas/platform/info')
            .then(response => response.json())
            .then(data => {
                document.getElementById('components-count').textContent = data.statistics.components;
                document.getElementById('templates-count').textContent = data.statistics.templates;
                document.getElementById('systems-count').textContent = data.statistics.systems;
                document.getElementById('teams-count').textContent = data.statistics.teams;
            })
            .catch(error => {
                console.error('Error loading statistics:', error);
                document.getElementById('components-count').textContent = '?';
                document.getElementById('templates-count').textContent = '?';
                document.getElementById('systems-count').textContent = '?';
                document.getElementById('teams-count').textContent = '?';
            });
    </script>
</body>
</html>
  `);
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 DevOpsCanvas Enhanced Portal running on port ${port}`);
  console.log(`📊 Loaded ${catalogEntities.length} catalog entities`);
  console.log(`🏗️ Loaded ${templateEntities.length} templates`);
  console.log(`👥 Loaded ${orgEntities.length} org entities`);
  console.log(`🌐 Portal available at http://localhost:${port}`);
});

module.exports = app;