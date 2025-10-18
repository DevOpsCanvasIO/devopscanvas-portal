const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const port = parseInt(process.env.PORT || '7007', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for demo
}));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/healthcheck', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'DevOpsCanvas Portal',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    features: ['catalog', 'templates', 'scorecards', 'search']
  });
});

// Backstage-compatible API endpoints
app.get('/api/catalog/entities', (req, res) => {
  const entities = [
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-control-plane',
        title: 'DevOpsCanvas Control Plane',
        description: 'API backend for DevOpsCanvas platform',
        labels: {
          'app.kubernetes.io/name': 'devopscanvas-control-plane'
        },
        annotations: {
          'backstage.io/managed-by-location': 'url:https://github.com/DevOpsCanvasIO/devopscanvas-control-plane/blob/main/catalog-info.yaml'
        }
      },
      spec: {
        type: 'service',
        lifecycle: 'production',
        owner: 'platform-team',
        system: 'devopscanvas'
      },
      relations: [
        {
          type: 'ownedBy',
          targetRef: 'group:platform-team'
        }
      ]
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'devopscanvas-portal',
        title: 'DevOpsCanvas Portal',
        description: 'Developer portal for DevOpsCanvas platform',
        labels: {
          'app.kubernetes.io/name': 'devopscanvas-portal'
        }
      },
      spec: {
        type: 'website',
        lifecycle: 'production',
        owner: 'platform-team',
        system: 'devopscanvas'
      }
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'System',
      metadata: {
        name: 'devopscanvas',
        title: 'DevOpsCanvas Platform',
        description: 'Complete DevOps platform for modern development teams'
      },
      spec: {
        owner: 'platform-team'
      }
    }
  ];
  
  res.json(entities);
});

// Templates endpoint
app.get('/api/scaffolder/v2/templates', (req, res) => {
  const templates = [
    {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'node-service',
        title: 'Node.js Microservice',
        description: 'Create a production-ready Node.js microservice with DevOpsCanvas best practices',
        tags: ['nodejs', 'microservice', 'api']
      },
      spec: {
        owner: 'platform-team',
        type: 'service',
        parameters: [
          {
            title: 'Service Information',
            required: ['name', 'description', 'owner'],
            properties: {
              name: {
                title: 'Service Name',
                type: 'string',
                description: 'Unique name of the service',
                pattern: '^[a-z0-9-]+$'
              },
              description: {
                title: 'Description',
                type: 'string',
                description: 'Brief description of the service'
              },
              owner: {
                title: 'Owner',
                type: 'string',
                description: 'Team or individual responsible for this service',
                default: 'platform-team'
              }
            }
          },
          {
            title: 'Configuration',
            properties: {
              port: {
                title: 'Port',
                type: 'number',
                description: 'Port number for the service',
                default: 3000
              },
              database: {
                title: 'Database',
                type: 'string',
                description: 'Database type',
                enum: ['postgresql', 'mysql', 'mongodb', 'none'],
                default: 'postgresql'
              }
            }
          }
        ]
      }
    },
    {
      apiVersion: 'scaffolder.backstage.io/v1beta3',
      kind: 'Template',
      metadata: {
        name: 'react-app',
        title: 'React Frontend Application',
        description: 'Create a modern React application with TypeScript and DevOpsCanvas tooling',
        tags: ['react', 'frontend', 'typescript']
      },
      spec: {
        owner: 'platform-team',
        type: 'website',
        parameters: [
          {
            title: 'Application Information',
            required: ['name', 'description'],
            properties: {
              name: {
                title: 'App Name',
                type: 'string',
                description: 'Name of the React application'
              },
              description: {
                title: 'Description',
                type: 'string',
                description: 'Brief description of the application'
              }
            }
          }
        ]
      }
    }
  ];
  
  res.json(templates);
});

// Scorecards API
app.get('/api/scorecards', (req, res) => {
  const scorecards = [
    {
      entity: 'devopscanvas-control-plane',
      score: 85,
      status: 'Good',
      lastUpdated: new Date().toISOString(),
      checks: {
        security: { status: 'pass', score: 90 },
        performance: { status: 'pass', score: 85 },
        reliability: { status: 'warning', score: 75 },
        documentation: { status: 'pass', score: 90 },
        testing: { status: 'pass', score: 80 }
      }
    },
    {
      entity: 'devopscanvas-portal',
      score: 92,
      status: 'Excellent',
      lastUpdated: new Date().toISOString(),
      checks: {
        security: { status: 'pass', score: 95 },
        performance: { status: 'pass', score: 90 },
        reliability: { status: 'pass', score: 90 },
        documentation: { status: 'pass', score: 95 },
        testing: { status: 'pass', score: 85 }
      }
    }
  ];
  
  res.json(scorecards);
});

// Search API
app.get('/api/search/query', (req, res) => {
  const { term = '', filters = {} } = req.query;
  
  // Mock search results
  const results = [
    {
      type: 'software-catalog',
      document: {
        title: 'DevOpsCanvas Control Plane',
        text: 'API backend for DevOpsCanvas platform',
        location: '/catalog/default/component/devopscanvas-control-plane'
      }
    },
    {
      type: 'software-catalog', 
      document: {
        title: 'DevOpsCanvas Portal',
        text: 'Developer portal for DevOpsCanvas platform',
        location: '/catalog/default/component/devopscanvas-portal'
      }
    }
  ].filter(result => 
    !term || result.document.title.toLowerCase().includes(term.toLowerCase()) ||
    result.document.text.toLowerCase().includes(term.toLowerCase())
  );
  
  res.json({ results });
});

// Tech Radar API
app.get('/api/tech-radar', (req, res) => {
  const techRadar = {
    rings: [
      { id: 'adopt', name: 'ADOPT', color: '#93c47d' },
      { id: 'trial', name: 'TRIAL', color: '#93d2c2' },
      { id: 'assess', name: 'ASSESS', color: '#fbdb84' },
      { id: 'hold', name: 'HOLD', color: '#efafa9' }
    ],
    quadrants: [
      { id: 'tools', name: 'Tools' },
      { id: 'techniques', name: 'Techniques' },
      { id: 'platforms', name: 'Platforms' },
      { id: 'languages', name: 'Languages & Frameworks' }
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
        quadrant: 'languages',
        ring: 'adopt',
        description: 'Typed superset of JavaScript'
      },
      {
        id: 'backstage',
        title: 'Backstage',
        quadrant: 'tools',
        ring: 'trial',
        description: 'Developer portal platform'
      }
    ]
  };
  
  res.json(techRadar);
});

// Enhanced home page with Backstage-like UI
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 0;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 300;
        }
        
        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        
        .card {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        
        .card h3 {
          color: #667eea;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }
        
        .card p {
          color: #666;
          margin-bottom: 1rem;
        }
        
        .card a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .card a:hover {
          text-decoration: underline;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
        }
        
        .stat {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        
        .api-list {
          list-style: none;
          margin-top: 1rem;
        }
        
        .api-list li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
        }
        
        .api-list li:last-child {
          border-bottom: none;
        }
        
        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4caf50;
          margin-right: 0.5rem;
        }
        
        .nav {
          background: white;
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
        }
        
        .nav-links a {
          color: #333;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .nav-links a:hover {
          color: #667eea;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎨 DevOpsCanvas</h1>
        <p>Developer Portal & Platform Engineering Hub</p>
      </div>
      
      <nav class="nav">
        <div class="nav-container">
          <div style="font-weight: bold; color: #667eea;">DevOpsCanvas Portal</div>
          <ul class="nav-links">
            <li><a href="/api/catalog/entities">Catalog</a></li>
            <li><a href="/api/scaffolder/v2/templates">Templates</a></li>
            <li><a href="/api/scorecards">Scorecards</a></li>
            <li><a href="/api/tech-radar">Tech Radar</a></li>
          </ul>
        </div>
      </nav>
      
      <div class="container">
        <div class="stats">
          <div class="stat">
            <div class="stat-number">3</div>
            <div class="stat-label">Components</div>
          </div>
          <div class="stat">
            <div class="stat-number">2</div>
            <div class="stat-label">Templates</div>
          </div>
          <div class="stat">
            <div class="stat-number">92%</div>
            <div class="stat-label">Avg Score</div>
          </div>
          <div class="stat">
            <div class="stat-number">100%</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>
        
        <div class="grid">
          <div class="card">
            <h3>📋 Service Catalog</h3>
            <p>Discover and manage all your services, APIs, and components in one centralized location.</p>
            <ul class="api-list">
              <li><span class="status-indicator"></span>DevOpsCanvas Control Plane</li>
              <li><span class="status-indicator"></span>DevOpsCanvas Portal</li>
              <li><span class="status-indicator"></span>DevOpsCanvas System</li>
            </ul>
            <a href="/api/catalog/entities">Browse Catalog →</a>
          </div>
          
          <div class="card">
            <h3>🏗️ Service Templates</h3>
            <p>Create new services from golden path templates with built-in best practices and DevOps tooling.</p>
            <ul class="api-list">
              <li>Node.js Microservice Template</li>
              <li>React Frontend Application</li>
              <li>Python API Service</li>
            </ul>
            <a href="/api/scaffolder/v2/templates">View Templates →</a>
          </div>
          
          <div class="card">
            <h3>📊 Service Scorecards</h3>
            <p>Monitor service health, security, and compliance with automated scorecards and metrics.</p>
            <ul class="api-list">
              <li><span class="status-indicator"></span>Security: 95% avg</li>
              <li><span class="status-indicator"></span>Performance: 88% avg</li>
              <li><span class="status-indicator"></span>Reliability: 90% avg</li>
            </ul>
            <a href="/api/scorecards">View Scorecards →</a>
          </div>
          
          <div class="card">
            <h3>🔍 Search & Discovery</h3>
            <p>Quickly find services, APIs, documentation, and resources across your entire platform.</p>
            <ul class="api-list">
              <li>Full-text search across all entities</li>
              <li>Filter by type, owner, lifecycle</li>
              <li>Advanced query capabilities</li>
            </ul>
            <a href="/api/search/query">Search API →</a>
          </div>
          
          <div class="card">
            <h3>🎯 Tech Radar</h3>
            <p>Track technology adoption, evaluate new tools, and maintain technology standards across teams.</p>
            <ul class="api-list">
              <li>Technology assessment framework</li>
              <li>Adoption lifecycle tracking</li>
              <li>Team recommendations</li>
            </ul>
            <a href="/api/tech-radar">View Tech Radar →</a>
          </div>
          
          <div class="card">
            <h3>⚡ Platform Status</h3>
            <p>Real-time status of all platform services and infrastructure components.</p>
            <ul class="api-list">
              <li><span class="status-indicator"></span>Portal: Healthy</li>
              <li><span class="status-indicator"></span>Control Plane: Healthy</li>
              <li><span class="status-indicator"></span>Infrastructure: Healthy</li>
            </ul>
            <a href="/healthcheck">Health Check →</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 DevOpsCanvas Portal running on port ${port}`);
  console.log(`📋 Service Catalog: http://localhost:${port}/api/catalog/entities`);
  console.log(`🏗️ Templates: http://localhost:${port}/api/scaffolder/v2/templates`);
  console.log(`📊 Scorecards: http://localhost:${port}/api/scorecards`);
  console.log(`❤️ Health Check: http://localhost:${port}/healthcheck`);
});

module.exports = app;